import PassengerProfile from "../models/passengerProfile.js";
import AppError from "../utils/AppError.js";
import { cloudinaryUploadBuffer } from "../utils/cloudinaryUpload.js";

// Get my passenger profile
const getMyPassengerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await PassengerProfile.findOne({ user: userId }).populate(
      "user",
      "firstName lastName email"
    );

    if (!profile) {
      return next(new AppError("Passenger profile not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// Register or save passenger profile draft
const registerPassengerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isDraft = req.body.isDraft === "true" || req.body.isDraft === true;

    // 1. Fetch or create passenger profile
    let profile = await PassengerProfile.findOne({ user: userId });
    if (!profile) {
      profile = new PassengerProfile({ user: userId });
    }

    // 2. Handle Profile Photo Upload to Cloudinary
    if (req.files && req.files.profilePhoto && req.files.profilePhoto[0]) {
      const uploadResult = await cloudinaryUploadBuffer(
        req.files.profilePhoto[0].buffer,
        "passenger_profiles"
      );
      profile.profilePhoto = uploadResult.secure_url;
    }

    // 3. Populate Fields from Request Body
    // Personal Info
    if (req.body.fullName) profile.fullName = req.body.fullName;
    if (req.body.passengerIdNumber) profile.passengerIdNumber = req.body.passengerIdNumber;
    if (req.body.dateOfBirth) profile.dateOfBirth = req.body.dateOfBirth;
    if (req.body.contactNumber) profile.contactNumber = req.body.contactNumber;
    if (req.body.email) profile.email = req.body.email;
    if (req.body.residentialAddress) profile.residentialAddress = req.body.residentialAddress;

    // City & Route Info
    if (req.body.currentCity) profile.currentCity = req.body.currentCity;
    if (req.body.destinationCity) profile.destinationCity = req.body.destinationCity;
    if (req.body.preferredRoute) profile.preferredRoute = req.body.preferredRoute;
    if (req.body.travelFrequency) profile.travelFrequency = req.body.travelFrequency;
    if (req.body.additionalStops) profile.additionalStops = req.body.additionalStops;

    // Accessibility checkboxes
    if (req.body.accessibilityWheelchair !== undefined) {
      profile.accessibilityWheelchair = req.body.accessibilityWheelchair === "true" || req.body.accessibilityWheelchair === true;
    }
    if (req.body.accessibilityPrioritySeating !== undefined) {
      profile.accessibilityPrioritySeating = req.body.accessibilityPrioritySeating === "true" || req.body.accessibilityPrioritySeating === true;
    }
    if (req.body.accessibilityAssistance !== undefined) {
      profile.accessibilityAssistance = req.body.accessibilityAssistance === "true" || req.body.accessibilityAssistance === true;
    }

    // Travel Preferences
    if (req.body.preferredDepartureTime) profile.preferredDepartureTime = req.body.preferredDepartureTime;
    if (req.body.preferredArrivalTime) profile.preferredArrivalTime = req.body.preferredArrivalTime;
    if (req.body.flexibleSchedule !== undefined) {
      profile.flexibleSchedule = req.body.flexibleSchedule === "true" || req.body.flexibleSchedule === true;
    }
    if (req.body.paymentMethod) profile.paymentMethod = req.body.paymentMethod;
    if (req.body.emergencyContactName) profile.emergencyContactName = req.body.emergencyContactName;
    if (req.body.emergencyContactNumber) profile.emergencyContactNumber = req.body.emergencyContactNumber;

    // Additional Info
    if (req.body.idDocumentType) profile.idDocumentType = req.body.idDocumentType;
    if (req.body.idDocumentNumber) profile.idDocumentNumber = req.body.idDocumentNumber;
    if (req.body.dietaryMedicalNotes) profile.dietaryMedicalNotes = req.body.dietaryMedicalNotes;

    // Certification
    if (req.body.certifiedAccurate !== undefined) {
      profile.certifiedAccurate = req.body.certifiedAccurate === "true" || req.body.certifiedAccurate === true;
    }

    // 4. Validate Required Fields on Submission
    if (!isDraft) {
      // Validate Personal Info
      if (!profile.fullName) return next(new AppError("Full name is required", 400));
      if (!profile.passengerIdNumber) return next(new AppError("Passenger ID number is required", 400));
      if (!profile.dateOfBirth) return next(new AppError("Date of birth is required", 400));
      if (!profile.contactNumber) return next(new AppError("Contact number is required", 400));
      if (!profile.email) return next(new AppError("Email address is required", 400));
      if (!profile.residentialAddress) return next(new AppError("Residential address is required", 400));

      // Validate City & Route Info
      if (!profile.currentCity) return next(new AppError("Current city/town is required", 400));
      if (!profile.destinationCity) return next(new AppError("Destination city is required", 400));

      // Validate Preferences
      if (!profile.preferredDepartureTime) return next(new AppError("Preferred departure time is required", 400));
      if (!profile.emergencyContactName) return next(new AppError("Emergency contact name is required", 400));
      if (!profile.emergencyContactNumber) return next(new AppError("Emergency contact number is required", 400));

      // Validate ID Document details
      if (!profile.idDocumentType) return next(new AppError("ID document type is required", 400));
      if (!profile.idDocumentNumber) return next(new AppError("ID document number is required", 400));

      // Validate Certification
      if (!profile.certifiedAccurate) {
        return next(new AppError("You must agree to the terms and conditions", 400));
      }

      profile.status = "completed";
    } else {
      profile.status = "draft";
    }

    // 5. Save the profile
    await profile.save();

    res.status(200).json({
      status: "success",
      message: isDraft
        ? "Passenger registration progress saved as draft."
        : "Passenger registration completed successfully.",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyPassengerProfile,
  registerPassengerProfile,
};
