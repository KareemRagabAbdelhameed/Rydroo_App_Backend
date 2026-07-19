import mongoose from "mongoose";

const routePermitSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "DriverProfile", required: true },
  permitNumber: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  permitType: { type: String, enum: ["Interstate", "Intrastate", "Special"] },
  authorizedRoutes: { type: String },
  permitDocument: { type: String }, // Cloudinary URL
}, { timestamps: true });

export default mongoose.model("RoutePermit", routePermitSchema);
