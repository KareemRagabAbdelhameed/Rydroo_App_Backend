import express from "express";
import vehicleController from "../controllers/vehicleController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { validateZod } from "../middlewares/validateZod.js";
import { addVehicleSchema } from "../validations/vehicleValidations.js";

const router = express.Router();
router.post("/addVehicle", verifyToken, validateZod(addVehicleSchema), vehicleController.addVehicle);
export default router;