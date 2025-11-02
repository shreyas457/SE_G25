// models/rerouteModel.js
import mongoose from "mongoose";

const RerouteSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // restaurant is optional since your orderModel isn’t shown here
    restaurantId: { type: mongoose.Schema.Types.ObjectId },
    restaurantName: { type: String },

    shelterId: { type: mongoose.Schema.Types.ObjectId, required: true },
    shelterName: { type: String },
    shelterAddress: { type: String },
    shelterContactEmail: { type: String },
    shelterContactPhone: { type: String },

    items: [
      {
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    total: Number,

    // optional audit fields
    reason: String,
    by: { type: mongoose.Schema.Types.ObjectId }, // user who performed the action (if you have auth)
  },
  { timestamps: true }
);

const rerouteModel = mongoose.model("reroutes", RerouteSchema);
export default rerouteModel;
