import mongoose from "mongoose";

const driverProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // Personal Information
  fullName: { type: String },
  driverIdNumber: { type: String },
  dateOfBirth: { type: Date },
  contactNumber: { type: String },
  email: { type: String },
  residentialAddress: { type: String },

  // Driver's License Details
  licenseNumber: { type: String },
  licenseClass: { type: String, enum: ["Class A", "Class B", "Class C", "Class D", "Class E"] },
  licenseIssueDate: { type: Date },
  licenseExpiresAt: { type: Date },
  issuingAuthority: { type: String },
  endorsements: { type: String },
  licenseFrontImage: { type: String }, // Cloudinary URL
  licenseBackImage: { type: String },  // Cloudinary URL

  // Status & Ratings
  status: { type: String, enum: ["draft", "pending", "inactive", "available", "on-trip", "suspended", "rejected"], default: "draft" },
  rating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },

  // Relations
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  routePermit: { type: mongoose.Schema.Types.ObjectId, ref: "RoutePermit" },

  // Certification
  certifiedAccurate: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("DriverProfile", driverProfileSchema);