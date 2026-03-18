import express from "express";
import driverController from "../controllers/driverController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/createDriverProfile",verifyToken,driverController.createDriverProfile);
router.get("/getDriverProfile",verifyToken,driverController.getMyDriverProfile);
router.get("/getAvailableDrivers",verifyToken,driverController.getAvailableDrivers);
export default router