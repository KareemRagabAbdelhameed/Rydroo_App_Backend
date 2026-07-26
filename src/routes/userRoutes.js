import express from "express";
import asyncHandler from "express-async-handler";
import userController from "../controllers/userController.js";
import validateRequiredFields from "../middlewares/validateRequiredFields.js";
import verifyToken from "../middlewares/verifyToken.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import { validateZod } from "../middlewares/validateZod.js";
import { signupSchema, loginSchema } from "../validations/userValidations.js";

const router = express.Router();

router.post(
  "/signup",
  validateZod(signupSchema),
  asyncHandler(userController.signup)
);
router.post(
  "/login",
  optionalAuth, // If the user is already logged in add add his id
  validateZod(loginSchema),
  asyncHandler(userController.login)
);

router.post("/logout", verifyToken, asyncHandler(userController.logout));

router.post("/resend-otp", validateRequiredFields("resendOtp"), asyncHandler(userController.resendOtp));

router.post("/verify-otp", asyncHandler(userController.verifyOtp));

export default router;