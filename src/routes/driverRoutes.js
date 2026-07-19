import express from "express";
import driverController from "../controllers/driverController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { uploadRegistrationDocs } from "../middlewares/upload.js";

const router = express.Router();

router.post("/createDriverProfile", verifyToken, driverController.createDriverProfile);
router.get("/getDriverProfile", verifyToken, driverController.getMyDriverProfile);
router.get("/getAvailableDrivers", verifyToken, driverController.getAvailableDrivers);

// Comprehensive driver registration route supporting document uploads
router.post("/register", verifyToken, uploadRegistrationDocs, driverController.registerDriverProfile);

export default router;