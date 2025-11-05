import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// config variables
const currency = "usd";
const deliveryCharge = 5;
const frontend_URL = "http://localhost:5173";

// ==================== Cancel Order ====================
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // find order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // verify the user who cancels
    if (order.userId !== req.body.userId && order.claimedBy !== req.body.userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // update DB fields to reflect cancellation
    order.status = "Redistribute"; // available for others to claim
    order.claimedBy = null;
    order.claimedAt = null;
    await order.save();

    // notify other users via queue system if available
    const queueNotification = req.app.get("queueNotification");
    if (queueNotification) {
      queueNotification({
        orderId: orderId,
        orderItems: order.items,
        cancelledByUserId: req.body.userId,
        message:
          "An order has been cancelled and is available for redistribution",
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
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
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
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.json({ success: false, message: "Not Verified" });
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
  claimOrder,
};
