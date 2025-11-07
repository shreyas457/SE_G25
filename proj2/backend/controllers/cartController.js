import userModel from "../models/userModel.js";

/**
 * Adds an item to the user's cart or increments its quantity if already present
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - MongoDB _id of the user
 * @param {string} req.body.itemId - MongoDB _id of the food item to add
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and message
 */
const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findOne({ _id: req.body.userId });
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

/**
 * Removes one quantity of an item from the user's cart
 * Does not allow quantity to go below zero
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - MongoDB _id of the user
 * @param {string} req.body.itemId - MongoDB _id of the food item to remove
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and message
 */
const removeFromCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

/**
 * Retrieves the user's current cart data
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - MongoDB _id of the user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and cart data object
 */
const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    res.json({ success: true, cartData: cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addToCart, removeFromCart, getCart };
