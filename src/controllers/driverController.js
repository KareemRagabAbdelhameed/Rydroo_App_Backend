import DriverProfile from "../models/driverProfile.js";
import AppError from "../utils/AppError.js";
const createDriverProfile = async(req,res,next)=>{
    const userId = req.user.id;
    const { licenseNumber, licenseExpiresAt } = req.body;
    const existingProfile = await DriverProfile.findOne({user : userId});
    if (existingProfile) return next(new AppError("Driver profile exists", 400));
    const profile =await DriverProfile.create({
        user : userId,
        licenseNumber,
        licenseExpiresAt,
        status : "inactive"
    });

    const populatedProfile = await profile.populate({
        path: "user",
        select: "firstName lastName",
      });


    res.status(201).json({
        status: "success",
        message: "Driver profile created. Add your vehicle next.",
        data: populatedProfile
      });
}


const getMyDriverProfile = async (req, res, next) => {
  const userId = req.user.id;

  const profile = await DriverProfile.findOne({ user: userId })
    .populate("user", "firstName lastName")
    .populate("vehicle");

  if (!profile) {
    return next(new AppError("Driver profile not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: profile,
  });
};

export default {createDriverProfile,getMyDriverProfile}