import mongoose from "mongoose";

const shelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    contactName: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    capacity: { type: Number, default: 0 },
    address: {
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: { type: String, default: "United States" },
    },
    active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

const shelterModel =
  mongoose.models.shelter || mongoose.model("shelter", shelterSchema);

export default shelterModel;
