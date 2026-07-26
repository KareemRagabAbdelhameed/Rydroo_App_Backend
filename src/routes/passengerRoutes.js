import express from "express";
import passengerController from "../controllers/passengerController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { uploadPassengerPhoto } from "../middlewares/upload.js";
import { validateZod } from "../middlewares/validateZod.js";
import { registerPassengerSchema } from "../validations/passengerValidations.js";

const router = express.Router();

// Retrieve passenger profile
router.get("/profile", verifyToken, passengerController.getMyPassengerProfile);

// Register passenger profile (handles both draft and full submission)
// Note: validateZod must run after uploadPassengerPhoto so it has access to req.body created by multer
router.post(
  "/register",
  verifyToken,
  uploadPassengerPhoto,
  validateZod(registerPassengerSchema),
  passengerController.registerPassengerProfile
);

export default router;
