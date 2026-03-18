import express from "express";
import asyncHandler from "express-async-handler";
import tripsController from "../controllers/tripsController.js"
import catchAsync from "../utils/catchAsync.js";
import verifyToken from "../middlewares/verifyToken.js";
import userRoles from "../utils/userRoles.js";
import allowedTo from "../middlewares/allowedTo.js";
const router = express.Router();
router.get("/",tripsController.getAllTrips);
router.get("/:tripId",catchAsync(tripsController.getSingleTrip));
router.post("/",verifyToken,allowedTo(userRoles.ADMIN),catchAsync(tripsController.createTrip));
router.patch("/:tipId/start",verifyToken,allowedTo(userRoles.ADMIN, userRoles.DRIVER),catchAsync(tripsController.startTrip));
router.patch("/:tipId/complete",verifyToken,allowedTo(userRoles.ADMIN, userRoles.DRIVER),catchAsync(tripsController.completeTrip));
router.patch("/:tripId",verifyToken,allowedTo(userRoles.ADMIN),catchAsync(tripsController.updateTrip));
router.patch("/:tripId/cancel",verifyToken,allowedTo(userRoles.ADMIN),catchAsync(tripsController.cancelTrip));
router.patch("/:tripId/book",verifyToken,catchAsync(tripsController.bookSeats));
export default router