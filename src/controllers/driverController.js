import DriverProfile from "../models/driverProfile.js";
import Vehicle from "../models/vehicle.js";
import RoutePermit from "../models/routePermit.js";
import AppError from "../utils/AppError.js";
import { cloudinaryUploadBuffer } from "../utils/cloudinaryUpload.js";

// Legacy simple driver profile creation
const createDriverProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { licenseNumber, licenseExpiresAt } = req.body;
  const existingProfile = await DriverProfile.findOne({ user: userId });
  if (existingProfile) return next(new AppError("Driver profile exists", 400));
  
  const profile = await DriverProfile.create({
    user: userId,
    licenseNumber,
    licenseExpiresAt,
    status: "inactive"
  });

  const populatedProfile = await profile.populate({
    path: "user",
    select: "firstName lastName",
  });

  res.status(201).json({
    status: "success",
    message: "Driver profile created. Add your vehicle next.",
    data: populatedProfile
  });
};

// Get my driver profile
const getMyDriverProfile = async (req, res, next) => {
  const userId = req.user.id;

  const profile = await DriverProfile.findOne({ user: userId })
    .populate("user", "firstName lastName email")
    .populate("vehicle")
    .populate("routePermit");

  if (!profile) {
    return next(new AppError("Driver profile not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: profile,
  });
};

// Get available drivers
const getAvailableDrivers = async (req, res, next) => {
  const drivers = await DriverProfile.find({ status: "available" })
    .populate("user", "firstName lastName")
    .populate("vehicle")
    .populate("routePermit");

  res.status(200).json({
    status: "success",
    results: drivers.length,
    data: drivers
  });
};

// New comprehensive Driver Registration API
const registerDriverProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isDraft = req.body.isDraft === "true" || req.body.isDraft === true;

    // 1. Fetch existing driver profile or initiate a new one
    let profile = await DriverProfile.findOne({ user: userId });
    let vehicle = null;
    let routePermit = null;

    if (profile) {
      if (profile.vehicle) {
        vehicle = await Vehicle.findById(profile.vehicle);
      }
      if (profile.routePermit) {
        routePermit = await RoutePermit.findById(profile.routePermit);
      }
    } else {
      profile = new DriverProfile({ user: userId });
    }

    if (!vehicle) {
      vehicle = new Vehicle({ owner: userId });
    }
    if (!routePermit) {
      routePermit = new RoutePermit({ driver: profile._id });
    }

    // 2. Handle File Uploads to Cloudinary (if any files are attached)
    if (req.files) {
      if (req.files.licenseFrontImage && req.files.licenseFrontImage[0]) {
        const uploadResult = await cloudinaryUploadBuffer(
          req.files.licenseFrontImage[0].buffer,
          "driver_licenses"
        );
        profile.licenseFrontImage = uploadResult.secure_url;
      }
      if (req.files.licenseBackImage && req.files.licenseBackImage[0]) {
        const uploadResult = await cloudinaryUploadBuffer(
          req.files.licenseBackImage[0].buffer,
          "driver_licenses"
        );
        profile.licenseBackImage = uploadResult.secure_url;
      }
      if (req.files.permitDocument && req.files.permitDocument[0]) {
        const uploadResult = await cloudinaryUploadBuffer(
          req.files.permitDocument[0].buffer,
          "route_permits"
        );
        routePermit.permitDocument = uploadResult.secure_url;
      }
      if (req.files.vehicleLicenseDocument && req.files.vehicleLicenseDocument[0]) {
        const uploadResult = await cloudinaryUploadBuffer(
          req.files.vehicleLicenseDocument[0].buffer,
          "vehicle_licenses"
        );
        vehicle.vehicleLicenseDocument = uploadResult.secure_url;
      }
    }

    // 3. Populate Fields from Request Body
    // Personal Info
    if (req.body.fullName) profile.fullName = req.body.fullName;
    if (req.body.driverIdNumber) profile.driverIdNumber = req.body.driverIdNumber;
    if (req.body.dateOfBirth) profile.dateOfBirth = req.body.dateOfBirth;
    if (req.body.contactNumber) profile.contactNumber = req.body.contactNumber;
    if (req.body.email) profile.email = req.body.email;
    if (req.body.residentialAddress) profile.residentialAddress = req.body.residentialAddress;

    // License Details
    if (req.body.licenseNumber) profile.licenseNumber = req.body.licenseNumber;
    if (req.body.licenseClass) profile.licenseClass = req.body.licenseClass;
    if (req.body.licenseIssueDate) profile.licenseIssueDate = req.body.licenseIssueDate;
    if (req.body.licenseExpiresAt) profile.licenseExpiresAt = req.body.licenseExpiresAt;
    if (req.body.issuingAuthority) profile.issuingAuthority = req.body.issuingAuthority;
    if (req.body.endorsements) profile.endorsements = req.body.endorsements;

    // Certification
    if (req.body.certifiedAccurate !== undefined) {
      profile.certifiedAccurate = req.body.certifiedAccurate === "true" || req.body.certifiedAccurate === true;
    }

    // Vehicle Details
    if (req.body.registrationNumber) vehicle.registrationNumber = req.body.registrationNumber;
    if (req.body.vehicleType) vehicle.vehicleType = req.body.vehicleType;
    if (req.body.make) vehicle.make = req.body.make;
    if (req.body.model) vehicle.model = req.body.model;
    if (req.body.year) vehicle.year = req.body.year;
    if (req.body.color) vehicle.color = req.body.color;
    if (req.body.plateNumber) vehicle.plateNumber = req.body.plateNumber;
    if (req.body.insurancePolicyNumber) vehicle.insurancePolicyNumber = req.body.insurancePolicyNumber;
    if (req.body.insuranceExpiryDate) vehicle.insuranceExpiryDate = req.body.insuranceExpiryDate;

    // Route Permit Details
    if (req.body.permitNumber) routePermit.permitNumber = req.body.permitNumber;
    if (req.body.permitIssueDate) routePermit.issueDate = req.body.permitIssueDate;
    if (req.body.permitExpiryDate) routePermit.expiryDate = req.body.permitExpiryDate;
    if (req.body.permitType) routePermit.permitType = req.body.permitType;
    if (req.body.authorizedRoutes) routePermit.authorizedRoutes = req.body.authorizedRoutes;

    // 4. Validation for Full Submission (Non-draft)
    if (!isDraft) {
      // Validate Personal Info
      if (!profile.fullName) return next(new AppError("Full name is required", 400));
      if (!profile.driverIdNumber) return next(new AppError("Driver ID number is required", 400));
      if (!profile.dateOfBirth) return next(new AppError("Date of birth is required", 400));
      if (!profile.contactNumber) return next(new AppError("Contact number is required", 400));
      if (!profile.email) return next(new AppError("Email address is required", 400));
      if (!profile.residentialAddress) return next(new AppError("Residential address is required", 400));

      // Validate License Details
      if (!profile.licenseNumber) return next(new AppError("License number is required", 400));
      if (!profile.licenseClass) return next(new AppError("License class/category is required", 400));
      if (!profile.licenseIssueDate) return next(new AppError("License issue date is required", 400));
      if (!profile.licenseExpiresAt) return next(new AppError("License expiry date is required", 400));
      if (!profile.issuingAuthority) return next(new AppError("Issuing authority is required", 400));
      if (!profile.licenseFrontImage) return next(new AppError("License front side document is required", 400));
      if (!profile.licenseBackImage) return next(new AppError("License back side document is required", 400));

      // Validate Vehicle Details
      if (!vehicle.registrationNumber) return next(new AppError("Vehicle registration number is required", 400));
      if (!vehicle.vehicleType) return next(new AppError("Vehicle type is required", 400));
      if (!vehicle.make) return next(new AppError("Vehicle make is required", 400));
      if (!vehicle.model) return next(new AppError("Vehicle model is required", 400));
      if (!vehicle.year) return next(new AppError("Vehicle year of manufacture is required", 400));
      if (!vehicle.plateNumber) return next(new AppError("License plate number is required", 400));
      if (!vehicle.insurancePolicyNumber) return next(new AppError("Insurance policy number is required", 400));
      if (!vehicle.insuranceExpiryDate) return next(new AppError("Insurance expiry date is required", 400));
      if (!vehicle.vehicleLicenseDocument) return next(new AppError("Vehicle license document is required", 400));

      // Validate Route Permit Details
      if (!routePermit.permitNumber) return next(new AppError("Route permit number is required", 400));
      if (!routePermit.issueDate) return next(new AppError("Route permit issue date is required", 400));
      if (!routePermit.expiryDate) return next(new AppError("Route permit expiry date is required", 400));
      if (!routePermit.permitType) return next(new AppError("Route permit type is required", 400));
      if (!routePermit.permitDocument) return next(new AppError("Route permit document is required", 400));

      // Validate Certification
      if (!profile.certifiedAccurate) {
        return next(new AppError("You must certify that all provided information is accurate and complete", 400));
      }

      // If all validated, set status to pending review
      profile.status = "pending";
    } else {
      // If saving as draft, set status to draft
      profile.status = "draft";
    }

    // 5. Save all records
    await vehicle.save();
    
    routePermit.driver = profile._id;
    await routePermit.save();

    profile.vehicle = vehicle._id;
    profile.routePermit = routePermit._id;
    await profile.save();

    res.status(200).json({
      status: "success",
      message: isDraft
        ? "Driver registration progress saved as draft."
        : "Driver registration submitted successfully for review.",
      data: {
        profile,
        vehicle,
        routePermit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createDriverProfile,
  getMyDriverProfile,
  getAvailableDrivers,
  registerDriverProfile,
};