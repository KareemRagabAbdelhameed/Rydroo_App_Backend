import express from "express";
import vehicleController from "../controllers/vehicleController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();
router.post("/addVehicle",verifyToken,vehicleController.addVehicle);
export default router