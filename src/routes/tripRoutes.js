import express from "express";
import asyncHandler from "express-async-handler";
import tripsController from "../controllers/tripsController.js"
import catchAsync from "../utils/catchAsync.js";
const router = express.Router();
router.get("/",tripsController.getAllTrips);
router.get("/:tripId",catchAsync(tripsController.getSingleTrip));
router.post("/",catchAsync(tripsController.createTrip));
router.patch("/:tripId",catchAsync(tripsController.updateTrip));
router.patch("/:tripId/cancel",catchAsync(tripsController.cancelTrip));
router.patch("/:tripId/book",catchAsync(tripsController.bookSeats));
export default router