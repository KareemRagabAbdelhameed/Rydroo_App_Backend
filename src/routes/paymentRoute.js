import express from "express";
import paymentController from "../controllers/paymentController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { validateZod } from "../middlewares/validateZod.js";
import { createPaymentIntentSchema } from "../validations/paymentValidations.js";

const router = express.Router();
router.post("/", verifyToken, validateZod(createPaymentIntentSchema), paymentController.createPaymentIntent);
export default router;