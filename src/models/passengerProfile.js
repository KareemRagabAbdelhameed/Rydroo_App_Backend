import mongoose from "mongoose";

const passengerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // Personal Info
    fullName: { type: String },
    passengerIdNumber: { type: String },
    dateOfBirth: { type: Date },
    contactNumber: { type: String },
    email: { type: String },
    residentialAddress: { type: String },

    // City & Route Info
    currentCity: { type: String },
    destinationCity: { type: String },
    preferredRoute: { type: String },
    travelFrequency: { type: String },
    additionalStops: { type: String },
    accessibilityWheelchair: { type: Boolean, default: false },
    accessibilityPrioritySeating: { type: Boolean, default: false },
    accessibilityAssistance: { type: Boolean, default: false },

    // Travel Preferences
    preferredDepartureTime: { type: String },
    preferredArrivalTime: { type: String },
    flexibleSchedule: { type: Boolean, default: false },
    paymentMethod: { type: String },
    emergencyContactName: { type: String },
    emergencyContactNumber: { type: String },

    // Additional Info
    idDocumentType: { type: String },
    idDocumentNumber: { type: String },
    dietaryMedicalNotes: { type: String },
    profilePhoto: { type: String }, // Cloudinary URL

    // Status & Certification
    status: { type: String, enum: ["draft", "completed"], default: "draft" },
    certifiedAccurate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PassengerProfile", passengerProfileSchema);
