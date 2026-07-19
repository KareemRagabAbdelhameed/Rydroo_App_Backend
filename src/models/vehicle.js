import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  registrationNumber: { type: String },
  vehicleType: { type: String, enum: ["Truck", "Van", "Car", "Motorcycle"] },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  color: { type: String },
  plateNumber: { type: String, index: true },
  insurancePolicyNumber: { type: String },
  insuranceExpiryDate: { type: Date },
  vehicleLicenseDocument: { type: String }, // Cloudinary URL
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);