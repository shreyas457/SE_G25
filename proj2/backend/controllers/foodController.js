import foodModel from "../models/foodModel.js";
import fs from 'fs'
import path from "path";
import { fileURLToPath } from 'url';

// If using ES modules, you need to define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// all food list
// const listFood = async (req, res) => {
//     try {
//         const foods = await foodModel.find({})
//         res.json({ success: true, data: foods })
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Error" })
//     }

// }
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        const foodsWithImages = foods.map(food => {
            let imageData;
            imageData = `data:${food.image.contentType};base64,${food.image.data.toString('base64')}`;
            return {
                ...food.toObject(),
                image: imageData
            };
        });
        res.json({ success: true, data: foodsWithImages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// add food
const addFood = async (req, res) => {

    try {
        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category:req.body.category,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        })

        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete food
const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

export { listFood, addFood, removeFood }