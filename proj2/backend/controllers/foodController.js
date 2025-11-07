import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// If using ES modules, you need to define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// all food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    const foodsWithBase64 = foods.map((food) => {
      const foodObj = food.toObject();

      // Convert image buffer to base64
      if (foodObj.image && foodObj.image.data) {
        foodObj.image.data = foodObj.image.data.toString("base64");
      }

      // Convert 3D model buffer to base64
      if (foodObj.model3D && foodObj.model3D.data) {
        foodObj.model3D.data = foodObj.model3D.data.toString("base64");
      }

      return foodObj;
    });

    res.json({ success: true, data: foodsWithBase64 });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// add food
const addFood = async (req, res) => {
  try {
    const foodData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: {
        data: req.files.image[0].buffer,
        contentType: req.files.image[0].mimetype,
      },
    };

    // Add 3D model if provided
    if (req.files.model3D && req.files.model3D[0]) {
      foodData.model3D = {
        data: req.files.model3D[0].buffer,
        contentType: req.files.model3D[0].mimetype,
      };
    }

    const food = new foodModel(foodData);

    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// delete food
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {});

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { listFood, addFood, removeFood };
