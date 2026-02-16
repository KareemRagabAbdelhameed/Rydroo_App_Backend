import DriverProfile from "../models/driverProfile.js";
import AppError from "../utils/AppError.js";
import vehicle from "../models/vehicle.js";
const addVehicle = async(req,res,next)=>{
    const userId = req.user.id;
    const { make, model, year, plateNumber } = req.body;

    const driverProfile = await DriverProfile.findOne({ user:  userId});
    if (!driverProfile) return next(new AppError("Driver profile not found", 404));
    const newVehicle = await vehicle.create({
        owner : userId,
        make,
        model,
        year,
        plateNumber
    })

    driverProfile.vehicle = newVehicle._id;
    driverProfile.status = "available";

    await driverProfile.save();
    res.status(201).json({
        status: "success",
        message: "Vehicle added and driver is now available",
        data: newVehicle
      });
}
export default {addVehicle}