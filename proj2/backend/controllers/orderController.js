import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import shelterModel from "../models/shelterModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import rerouteModel from "../models/rerouteModel.js";

// config variables
const currency = "usd";
const deliveryCharge = 5;
const frontend_URL = "http://localhost:5173";

// Status constants & FSM rules
const STATUS = {
  PROCESSING: "Food Processing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  REDISTRIBUTE: "Redistribute",
  CANCELLED: "Cancelled",
  DONATED: "Donated", // NEW STATE
};

const STATUS_VALUES = new Set(Object.values(STATUS));

/**
 * Allowed transitions:
 *  - Food Processing   -> Out for delivery, Redistribute
 *  - Out for delivery  -> Delivered, Redistribute
 *  - Redistribute      -> Food Processing, Cancelled, Donated to shelter
 *  - Cancelled         -> Donated to shelter (admin-only)
 *  - Donated to shelter -> (terminal)
 *  - Delivered         -> (terminal)
 */
const ALLOWED_TRANSITIONS = {
  [STATUS.PROCESSING]: new Set([STATUS.OUT_FOR_DELIVERY, STATUS.REDISTRIBUTE]),
  [STATUS.OUT_FOR_DELIVERY]: new Set([STATUS.DELIVERED, STATUS.REDISTRIBUTE]),
  [STATUS.REDISTRIBUTE]: new Set([
    STATUS.PROCESSING,
    STATUS.CANCELLED,
    STATUS.DONATED,
  ]),
  [STATUS.CANCELLED]: new Set([STATUS.DONATED]),
  [STATUS.DONATED]: new Set(),
  [STATUS.DELIVERED]: new Set(),
};

/**
 * Checks if a status transition is allowed according to the order state machine
 * @param {string} from - Current order status
 * @param {string} to - Desired order status
 * @returns {boolean} True if transition is allowed, false otherwise
 */
function canTransition(from, to) {
  if (from === to) return true;
  const nexts = ALLOWED_TRANSITIONS[from] || new Set();
  return nexts.has(to);
}

/**
 * Cancels an order and moves it to Redistribute status
 * Only allows cancellation if order is in "Food Processing" or "Out for delivery" status
 * Queues a notification for redistribution if notification system is available
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.orderId - MongoDB _id of the order to cancel
 * @param {string} req.body.userId - MongoDB _id of the user cancelling the order
 * @param {Object} req.app - Express app object (for accessing notification queue)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and message
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order)
      return res.json({ success: false, message: "Order not found" });

    if (order.userId !== userId && order.claimedBy !== userId)
      return res.json({ success: false, message: "Unauthorized" });

    const current = order.status || STATUS.PROCESSING;
    const userCancelable = new Set([STATUS.PROCESSING, STATUS.OUT_FOR_DELIVERY]);
    if (!userCancelable.has(current))
      return res.json({
        success: false,
        message: `Cannot cancel when status is "${current}".`,
      });

    // When user cancels, move to Redistribute
    order.status = STATUS.REDISTRIBUTE;
    await order.save();

    const queueNotification = req.app.get("queueNotification");
    if (typeof queueNotification === "function") {
      queueNotification({
        orderId,
        orderItems: order.items,
        cancelledByUserId: userId,
        message: "Order cancelled by user; available for redistribution",
      });
    }

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.json({ success: false, message: "Error cancelling order" });
  }
};

/**
 * Allows a user to claim a redistributed order
 * Transfers ownership of the order to the claiming user and sets status to "Food Processing"
 * Preserves the original user ID for tracking purposes
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.orderId - MongoDB _id of the order to claim
 * @param {string} req.body.userId - MongoDB _id of the user claiming the order
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status, message, and order data
 */
const claimOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const claimerId = req.body.userId;

    const order = await orderModel.findById(orderId);
    if (!order)
      return res.json({ success: false, message: "Order not found" });

    if (order.status !== STATUS.REDISTRIBUTE)
      return res.json({
        success: false,
        message: "Order not available for claim",
      });

    // preserve who originally created it
    if (!order.originalUserId) order.originalUserId = order.userId;

    // transfer ownership
    order.userId = claimerId;
    order.claimedBy = claimerId;
    order.claimedAt = new Date();
    order.status = STATUS.PROCESSING;

    await order.save();

    res.json({
      success: true,
      message: "Order claimed successfully; it is now in Food Processing.",
      data: order,
    });
  } catch (error) {
    console.error("claimOrder error:", error);
    res.json({ success: false, message: "Error claiming order" });
  }
};

/**
 * Places a new order with Stripe payment
 * Creates order record and clears user's cart
 * Returns Stripe checkout session URL for payment verification
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - MongoDB _id of the user placing the order
 * @param {Array} req.body.items - Array of food items in the order
 * @param {number} req.body.amount - Total order amount
 * @param {Object} req.body.address - Delivery address object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and Stripe session URL
 */
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    res.json({
      success: true,
      session_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error });
  }
};

/**
 * Places a new order with Cash on Delivery (COD) payment
 * Creates order record with payment marked as true and clears user's cart
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - MongoDB _id of the user placing the order
 * @param {Array} req.body.items - Array of food items in the order
 * @param {number} req.body.amount - Total order amount
 * @param {Object} req.body.address - Delivery address object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and message
 */
const placeOrderCod = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

/**
 * Retrieves all orders from the database
 * Returns orders sorted by date in descending order (newest first)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and array of all orders
 */
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

/**
 * Retrieves all orders for a specific user
 * Includes both orders created by the user and orders claimed by the user
 * Returns orders sorted by date in descending order (newest first)
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - MongoDB _id of the user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and array of user's orders
 */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        $or: [{ userId: req.body.userId }, { claimedBy: req.body.userId }],
      })
      .sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

/**
 * Updates the status of an order
 * Validates the status transition according to the order state machine rules
 * Only allows transitions defined in ALLOWED_TRANSITIONS
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.orderId - MongoDB _id of the order to update
 * @param {string} req.body.status - New status value (must be valid and transitionable)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status, message, and updated order data
 */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status: next } = req.body;

    if (!STATUS_VALUES.has(next))
      return res.json({ success: false, message: "Invalid status value" });

    const order = await orderModel.findById(orderId);
    if (!order)
      return res.json({ success: false, message: "Order not found" });

    const current = order.status || STATUS.PROCESSING;
    if (current === next)
      return res.json({
        success: true,
        message: "Status unchanged",
        data: order,
      });

    if (!canTransition(current, next)) {
      const allowed = [...(ALLOWED_TRANSITIONS[current] || [])];
      return res.json({
        success: false,
        message:
          `Illegal transition: "${current}" → "${next}". ` +
          `Allowed: ${allowed.length ? allowed.join(", ") : "none"}`,
      });
    }

    order.status = next;
    await order.save();
    return res.json({ success: true, message: "Status Updated", data: order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

/**
 * Verifies payment status after Stripe checkout
 * If payment successful, marks order as paid
 * If payment failed, deletes the order from database
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.orderId - MongoDB _id of the order to verify
 * @param {string} req.body.success - Payment status ("true" or "false")
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and message
 */
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    res.json({ success: false, message: "Not Verified" });
  }
};

/**
 * Assigns a cancelled or redistributed order to a shelter
 * Changes order status to "Donated" and creates a reroute record
 * Only allows assignment if order is in "Redistribute" or "Cancelled" status
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.orderId - MongoDB _id of the order to assign
 * @param {string} req.body.shelterId - MongoDB _id of the shelter
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status, message, and order data
 */
const assignShelter = async (req, res) => {
  try {
    const { orderId, shelterId } = req.body;

    if (!orderId || !shelterId)
      return res.json({
        success: false,
        message: "orderId and shelterId are required",
      });

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    const shelter = await shelterModel.findById(shelterId);
    if (!shelter)
      return res.json({ success: false, message: "Shelter not found" });

    const current = order.status || STATUS.PROCESSING;
    if (current !== STATUS.REDISTRIBUTE && current !== STATUS.CANCELLED)
      return res.json({
        success: false,
        message: `Order status is "${current}". Only "Redistribute" or "Cancelled" can be assigned.`,
      });

    if (order.shelter && order.shelter.id)
      return res.json({
        success: true,
        alreadyAssigned: true,
        message: "Order already assigned to a shelter",
        data: order,
      });

    // Move to DONATED state when assigning to shelter
    order.status = STATUS.DONATED;
    order.shelter = {
      id: shelter._id.toString(),
      name: shelter.name,
      contactEmail: shelter.contactEmail,
      contactPhone: shelter.contactPhone,
      address: shelter.address,
    };
    order.donationNotified = false;

    await order.save();

    await rerouteModel.create({
      orderId: order._id,
      restaurantId: order.restaurantId ?? undefined,
      restaurantName: order.restaurantName ?? undefined,
      shelterId: shelter._id,
      shelterName: shelter.name,
      shelterAddress: shelter.address,
      shelterContactEmail: shelter.contactEmail,
      shelterContactPhone: shelter.contactPhone,
      items: (order.items || []).map((it) => ({
        name: it.name,
        qty: it.quantity ?? it.qty ?? 1,
        price: it.price,
      })),
      total: order.amount ?? order.total,
    });

    return res.json({
      success: true,
      message: "Order assigned to shelter and marked as donated",
      data: order,
    });
  } catch (err) {
    console.log("assignShelter error:", err);
    return res.json({ success: false, message: "Error assigning shelter" });
  }
};

export {
  placeOrder,
  listOrders,
  userOrders,
  updateStatus,
  verifyOrder,
  placeOrderCod,
  cancelOrder,
  assignShelter,
  claimOrder,
};
