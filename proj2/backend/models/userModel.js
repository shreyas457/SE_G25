import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true, unique: true },
  password:{ type: String, required: true },
  cartData:{ type: Object, default: {} },
  address: {
    formatted: { type: String },   // full human-readable address
    lat:       { type: Number },   // latitude  
    lng:       { type: Number }    // longitude 
  }
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;


