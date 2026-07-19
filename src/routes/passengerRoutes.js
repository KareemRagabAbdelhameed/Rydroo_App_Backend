import express from "express";
import passengerController from "../controllers/passengerController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { uploadPassengerPhoto } from "../middlewares/upload.js";

const router = express.Router();

// Retrieve passenger profile
router.get("/profile", verifyToken, passengerController.getMyPassengerProfile);

// Register passenger profile (handles both draft and full submission)
router.post(
  "/register",
  verifyToken,
  uploadPassengerPhoto,
  passengerController.registerPassengerProfile
);

export default router;
