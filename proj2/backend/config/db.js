import mongoose from "mongoose";

export const  connectDB = async () =>{

    await mongoose.connect('mongodb+srv://SE_G25:SE_G25@cluster0.xle9ert.mongodb.net/food-del').then(()=>console.log("DB Connected"));

}