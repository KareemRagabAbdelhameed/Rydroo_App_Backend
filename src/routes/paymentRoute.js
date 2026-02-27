import express from "express";
import paymentController from "../controllers/paymentController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();
router.post("/",verifyToken,paymentController.createPaymentIntent)
export default router