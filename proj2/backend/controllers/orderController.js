import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import rerouteModel from '../models/rerouteModel.js';

// config variables
const currency = "usd";
const deliveryCharge = 5;
const frontend_URL = "http://localhost:5173";

/* ================================
   Status constants & FSM rules
   ================================ */
const STATUS = {
  PROCESSING: "Food Processing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  REDISTRIBUTE: "Redistribute",
  CANCELLED: "Cancelled",
};

const STATUS_VALUES = new Set(Object.values(STATUS));

/**
 * Allowed transitions:
 *  - Food Processing   -> Out for delivery, Redistribute
 *  - Out for delivery  -> Delivered, Redistribute
 *  - Redistribute      -> Out for delivery, Cancelled
 *  - Delivered         -> (terminal)
 *  - Cancelled         -> (terminal)
 */
const ALLOWED_TRANSITIONS = {
  [STATUS.PROCESSING]: new Set([STATUS.OUT_FOR_DELIVERY, STATUS.REDISTRIBUTE]),
  [STATUS.OUT_FOR_DELIVERY]: new Set([STATUS.DELIVERED, STATUS.REDISTRIBUTE]),
  [STATUS.REDISTRIBUTE]: new Set([STATUS.OUT_FOR_DELIVERY, STATUS.CANCELLED]),
  [STATUS.DELIVERED]: new Set(),
  [STATUS.CANCELLED]: new Set(),
};

function canTransition(from, to) {
  if (from === to) return true; // idempotent no-op
  const nexts = ALLOWED_TRANSITIONS[from] || new Set();
  return nexts.has(to);
}

/* ================================
   Controllers
   ================================ */

// Cancel Order with queue notification
// - Allowed from Processing or Out for delivery
// - Sets status to Redistribute (so ops can route it)
const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    // find order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // verify the user who cancels
    if (order.userId !== req.body.userId && order.claimedBy !== req.body.userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const current = order.status || STATUS.PROCESSING;
    const userCancelable = new Set([STATUS.PROCESSING, STATUS.OUT_FOR_DELIVERY]);

    if (!userCancelable.has(current)) {
      return res.json({
        success: false,
        message: `Cannot cancel when status is "${current}".`,
      });
    }

    order.status = STATUS.REDISTRIBUTE;
    await order.save();

    // Notify queue for redistribution workflow
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

// ==================== Claim Order ====================
const claimOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const claimerId = req.body.userId; // user claiming the order

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Only allow claiming if it's available
    if (order.status !== "Redistribute") {
      return res.json({
        success: false,
        message: "Order not available for claim",
      });
    }

    // Update the DB to mark as claimed
    order.status = "Claimed";
    order.claimedBy = claimerId;
    order.claimedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: "Order successfully claimed",
      data: order,
    });
  } catch (error) {
    console.error("claimOrder error:", error);
    res.json({ success: false, message: "Error claiming order" });
  }
};

// ==================== Place Order (Stripe) ====================
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

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: { name: "Delivery Charge" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    res.json({
      success: true,
      session_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error });
  }
};

// ==================== Place Order (COD) ====================
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

// ==================== List Orders (Admin) ====================
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ==================== User Orders ====================
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        $or: [
          { userId: req.body.userId },
          { claimedBy: req.body.userId }
        ]
      })
      .sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ==================== Update Status ====================
// Admin updates order status (validates values + enforces FSM)
const updateStatus = async (req, res) => {
  try {
    const { orderId, status: next } = req.body;

    if (!STATUS_VALUES.has(next)) {
      return res.json({ success: false, message: "Invalid status value" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    const current = order.status || STATUS.PROCESSING;

    if (current === next) {
      return res.json({
        success: true,
        message: "Status unchanged",
        data: order,
      });
    }

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

// ==================== Verify Payment ====================
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
    res.json({ success: false, message: "Not  Verified" });
  }
};

/* ================================
   Assign a shelter to an order
   ================================ */
/**
 * Accepts orders that are currently in "Redistribute" (preferred) or "Cancelled"
 * (to tolerate UI that shows Cancelled). If it's Cancelled, we move it to
 * "Redistribute" and attach shelter metadata. If already assigned, we return
 * success with `alreadyAssigned: true`.
 *
 * Body: { orderId, shelterId }
 */
const assignShelter = async (req, res) => {
  try {
    const { orderId, shelterId } = req.body;

    if (!orderId || !shelterId) {
      return res.json({
        success: false,
        message: "orderId and shelterId are required",
      });
    }

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    const shelter = await shelterModel.findById(shelterId);
    if (!shelter)
      return res.json({ success: false, message: "Shelter not found" });

    const current = order.status || STATUS.PROCESSING;

    // Only allow assignment when it's in Redistribute or Cancelled.
    if (
      current !== STATUS.REDISTRIBUTE &&
      current !== STATUS.CANCELLED
    ) {
      return res.json({
        success: false,
        message: `Order status is "${current}". Only "Redistribute" or "Cancelled" can be assigned.`,
      });
    }

    // If already assigned, short-circuit (idempotent)
    if (order.shelter && order.shelter.id) {
      return res.json({
        success: true,
        alreadyAssigned: true,
        message: "Order already assigned to a shelter",
        data: order,
      });
    }

    // If Cancelled, move to Redistribute for ops workflow
    if (current === STATUS.CANCELLED) {
      order.status = STATUS.REDISTRIBUTE;
    }

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
      // include restaurant info if you have it on the order model
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
      message: "Order assigned to shelter",
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
