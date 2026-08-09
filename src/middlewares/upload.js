import multer from "multer";
import AppError from "../utils/AppError.js";

// Setup memory storage to keep files in buffer before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDFs, JPG, JPEG, and PNG
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new AppError("Only images (JPG, PNG) and PDFs are allowed!", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
});

// Driver registration fields to be accepted
export const uploadRegistrationDocs = upload.fields([
  { name: "nationalIdFrontImage", maxCount: 1 },
  { name: "nationalIdBackImage", maxCount: 1 },
  { name: "licenseFrontImage", maxCount: 1 },
  { name: "licenseBackImage", maxCount: 1 },
  { name: "itineraryLicenseFrontImage", maxCount: 1 },
  { name: "itineraryLicenseBackImage", maxCount: 1 },
  { name: "vehicleLicenseFrontImage", maxCount: 1 },
  { name: "vehicleLicenseBackImage", maxCount: 1 },
  { name: "vehiclePhoto", maxCount: 1 },
]);

// Passenger profile fields to be accepted
export const uploadPassengerPhoto = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
]);

export default uploadRegistrationDocs;
