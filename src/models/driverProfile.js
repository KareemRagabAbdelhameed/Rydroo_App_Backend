import mongoose from "mongoose";

const driverProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  licenseNumber: String,
  licenseExpiresAt: Date,
  status: { type: String, enum: ["inactive", "available", "on-trip", "suspended"], default: "inactive" },
  rating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
}, { timestamps: true });

export default mongoose.model("DriverProfile", driverProfileSchema);