import express from "express";
import driverController from "../controllers/driverController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { uploadRegistrationDocs } from "../middlewares/upload.js";
import { validateZod } from "../middlewares/validateZod.js";
import { createDriverProfileSchema, registerDriverSchema } from "../validations/driverValidations.js";

const router = express.Router();

router.post("/createDriverProfile", verifyToken, validateZod(createDriverProfileSchema), driverController.createDriverProfile);
router.get("/getDriverProfile", verifyToken, driverController.getMyDriverProfile);
router.get("/getAvailableDrivers", verifyToken, driverController.getAvailableDrivers);

// Comprehensive driver registration route supporting document uploads
// Note: validateZod must run after uploadRegistrationDocs so it has access to req.body created by multer
router.post("/register", verifyToken, uploadRegistrationDocs, validateZod(registerDriverSchema), driverController.registerDriverProfile);

export default router;