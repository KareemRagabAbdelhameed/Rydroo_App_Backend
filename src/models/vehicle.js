import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  make : String,
  model: String,
  year: Number,
  plateNumber: { type: String, required: true, index: true },
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);