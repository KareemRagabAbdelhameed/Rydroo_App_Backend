import Trip from "../models/tripModel.js"
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";
import DriverProfile from "../models/driverProfile.js";
import vehicle from "../models/vehicle.js"
const allowedUpdates = [
    "source",
    "destination",
    "date",
    "time",
    "availableSeats",
    "price",
    "currency",
    "status",
  ];

  const getAllTrips = async (req, res) => {
    try {
      const { source, destination, limit = 10, page = 1 } = req.query;
  
      const lang = req.headers["accept-language"] || "ar";
  
      const skip = (Number(page) - 1) * Number(limit);
  
      const filter = {
        status: "active",
        availableSeats: { $gt: 0 },
      };
  
      // search in correct locale
      if (source) {
        filter[`source.${lang}`] = source;
      }
  
      if (destination) {
        filter[`destination.${lang}`] = destination;
      }
  
      const trips = await Trip.find(filter, { __v: false })
        .populate({
          path: "driverProfile",
          populate: {
            path: "user",
            select: "firstName lastName",
          },
        })
        .populate({
          path: "vehicle",
          select: "make model plateNumber",
        })
        .limit(Number(limit))
        .skip(skip)
        .sort({ date: 1 });
  
      const total = await Trip.countDocuments(filter);
  
      const localizedTrips =
        Trip.schema.methods.toObjectLocalizedOnly(trips, lang);
  
      res.json({
        status: "Success",
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        data: localizedTrips,
      });
    } catch (error) {
      res.status(500).json({
        status: "Fail",
        message: error.message,
      });
    }
  };
const getSingleTrip = catchAsync(async(req,res,next)=>{
    const {tripId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(tripId)){
        return next(new AppError("Invalid trip ID format",400));
    }

    const trip =await Trip.findById(tripId)
    .populate({
      path : "driverProfile",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .populate({
      path : "vehicle",
      select: "make model plateNumber"
    });
    
    if(!trip){
        return next(new AppError("Trip not found",404))
    }

    const lang = req.headers.lang || "en";
    const localizedTrip = Trip.schema.methods.toObjectLocalizedOnly(
      trip,
      lang,
    )

    res.status(200).json({
        status : "success",
        data : localizedTrip
    })
})
const createTrip = catchAsync(async (req, res, next) => {
  const {
    source,
    destination,
    date,
    time,
    availableSeats,
    price,
    currency,
    driverProfileId, // جاي من الأدمن
  } = req.body;

  // 1️⃣ validations الأساسية
  if (
    !source ||
    !destination ||
    !date ||
    !time ||
    availableSeats === undefined ||
    price === undefined ||
    !driverProfileId
  ) {
    return next(new AppError("All trip fields are required", 400));
  }

  if (availableSeats <= 0) {
    return next(new AppError("Available seats must be greater than zero", 400));
  }

  if (price <= 0) {
    return next(new AppError("Trip price must be greater than zero", 400));
  }

  // 2️⃣ التأكد إن الرحلة مش مكررة
  const existingTrip = await Trip.findOne({
    source,
    destination,
    date,
    time,
  });

  if (existingTrip) {
    return next(
      new AppError("Trip already exists at the same time and date", 409)
    );
  }

  // 3️⃣ جلب السواق + العربية
  const driverProfile = await DriverProfile.findById(driverProfileId)
    .populate("user")
    .populate("vehicle");

  if (!driverProfile) {
    return next(new AppError("Driver not found", 404));
  }

  if (driverProfile.status !== "available") {
    return next(new AppError("Driver is not available", 400));
  }

  if (!driverProfile.vehicle) {
    return next(new AppError("Driver has no vehicle", 400));
  }

  // 4️⃣ إنشاء الرحلة
  const trip = await Trip.create({
    source,
    destination,
    date,
    time,
    availableSeats,
    price,
    currency,
    driver: driverProfile.user._id,
    driverProfile: driverProfile._id,
    vehicle: driverProfile.vehicle._id,
  });

  // 5️⃣ تحديث حالة السواق
  driverProfile.status = "on-trip";
  await driverProfile.save();

  res.status(201).json({
    status: "success",
    message: "Trip created successfully with assigned driver",
    data: trip,
  });
});


const updateTrip = catchAsync(async(req,res,next)=>{
    const {tripId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(tripId)){
        return next(new AppError("Invalid trip ID format", 400));
    }
    // Allow only specific fields
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields provided for update", 400));
      }

      if (
        updates.availableSeats !== undefined &&
        updates.availableSeats < 0
      ) {
        return next(
          new AppError("Available seats cannot be negative", 400)
        );
      }
    
      if (updates.price !== undefined && updates.price <= 0) {
        return next(new AppError("Price must be greater than zero", 400));
      }

      const trip = await Trip.findByIdAndUpdate({_id:tripId},updates,{new:true,runValidators:true});
      if (!trip) {
        return next(new AppError("Trip not found", 404));
      }

      res.status(200).json({
        status: "success",
        message : "trip updated successfully",
        data: trip,
      });

})

const cancelTrip = catchAsync(async(req,res,next)=>{
  const {tripId} = req.params;
  if(!mongoose.Types.ObjectId.isValid(tripId)){
    return next(new AppError("Invalid trip ID format",400));
  }
  const trip = await Trip.findById(tripId);
  if(!trip){
    return next(new AppError("Trip not found", 404));
  }

  if(trip.status==="cancelled"){
    return next(new AppError("Trip is already cancelled", 400));
  }
  // cancel trip
  trip.status = "cancelled";
  await trip.save();
  res.status(200).json({
    status: "success",
    message: "Trip cancelled successfully",
    data: trip,
  });
})

const bookSeats = catchAsync(async(req,res,next)=>{
  const {tripId} = req.params;
  const {seats} = req.body;
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return next(new AppError("Invalid trip ID format", 400));
  }
  if (!seats || seats <= 0) {
    return next(
      new AppError("Seats must be a number greater than zero", 400)
    );
  }

  const trip = await Trip.findOneAndUpdate(
    {
      _id : tripId,
      status : "active",
      availableSeats : {$gte : seats},
    },
    {
      $inc : {availableSeats : -seats}
    },
    {
      new : true
    }
  )

  if (!trip) {
    return next(
      new AppError(
        "Trip not found, cancelled, or not enough available seats",
        400
      )
    );
  }

  if (trip.availableSeats === 0) {
    trip.status = "completed";
    await trip.save();
  }

  res.status(200).json({
    status: "success",
    message: "Seats booked successfully",
    data: {
      tripId: trip._id,
      remainingSeats: trip.availableSeats,
    },
  });
})
export default {
    getAllTrips,
    getSingleTrip,
    createTrip,
    updateTrip,
    cancelTrip,
    bookSeats
  };