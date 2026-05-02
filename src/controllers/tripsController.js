import "dotenv/config";
import Trip from "../models/tripModel.js"
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";
import DriverProfile from "../models/driverProfile.js";
import vehicle from "../models/vehicle.js"
import Stripe from "stripe";
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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const getAllTrips = async (req, res) => {
    try {
      const { source, destination, limit = 10, page = 1 } = req.query;
  
      const lang = req.headers["accept-language"] || "ar";
  
      const skip = (Number(page) - 1) * Number(limit);
  
      const filter = {
        status: { $in: ["scheduled", "active"] },
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

    const lang = req.headers["accept-language"] || "ar";
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
    bookedSeats: [],
    price,
    currency,
    status : "scheduled",
    driver: driverProfile.user._id,
    driverProfile: driverProfile._id,
    vehicle: driverProfile.vehicle._id,
  });

  await DriverProfile.findByIdAndUpdate(
    trip.driverProfile,
    {status : "on-trip"}
  );

  res.status(201).json({
    status: "success",
    message: "Trip created successfully with assigned driver",
    data: trip,
  });
});

const startTrip = catchAsync(async (req, res, next) => {
  const { tripId } = req.params;

  const trip = await Trip.findById(tripId);

  if (!trip) return next(new AppError("Trip not found", 404));

  if (trip.status !== "scheduled" && trip.status !== "full")
    return next(new AppError("Trip cannot be started", 400));

  trip.status = "active";
  await trip.save();

  await DriverProfile.findByIdAndUpdate(
    trip.driverProfile,
    { status: "on-trip" }
  );

  res.status(200).json({
    status: "success",
    message: "Trip started successfully",
  });
});

const completeTrip = catchAsync(async (req, res, next) => {
  const { tripId } = req.params;

  const trip = await Trip.findById(tripId);

  if (!trip) return next(new AppError("Trip not found", 404));

  if (trip.status !== "active" && trip.status !== "full")
    return next(new AppError("Trip is not active", 400));

  trip.status = "completed";
  await trip.save();

  await DriverProfile.findByIdAndUpdate(
    trip.driverProfile,
    { status: "available" }
  );

  res.status(200).json({
    status: "success",
    message: "Trip completed successfully",
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
  if (trip.status === "completed")
    return next(new AppError("Completed trip cannot be cancelled", 400));

  if(trip.status==="cancelled"){
    return next(new AppError("Trip is already cancelled", 400));
  }
  const previousStatus = trip.status;
  // cancel trip
  trip.status = "cancelled";
  await trip.save();
  // should make the driver be available
  if (previousStatus === "active") {
    await DriverProfile.findByIdAndUpdate(
      trip.driverProfile,
      { status: "available" }
    );
  }

  res.status(200).json({
    status: "success",
    message: "Trip cancelled successfully",
    data: trip,
  });
})

const bookSeats = catchAsync(async (req, res, next) => {
  const { tripId } = req.params;
  const { selectedSeats, paymentIntentId } = req.body;

  const paymentIntent =
    await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return next(new AppError("Payment not completed", 400));
  }

  if (paymentIntent.metadata.tripId !== tripId) {
    return next(new AppError("Invalid payment data", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return next(new AppError("Invalid trip ID format", 400));
  }

  if (
    !Array.isArray(selectedSeats) ||
    selectedSeats.length === 0
  ) {
    return next(
      new AppError("Please select seats", 400)
    );
  }

  const hasInvalidSeat = selectedSeats.some(
    (seat) =>
      !Number.isInteger(seat) ||
      seat < 1 ||
      seat > 14
  );

  if (hasInvalidSeat) {
    return next(
      new AppError(
        "Seat numbers must be between 1 and 14",
        400
      )
    );
  }

  const trip = await Trip.findById(tripId);

  if (!trip) {
    return next(
      new AppError("Trip not found", 404)
    );
  }

  if (
    !["scheduled", "active"].includes(
      trip.status
    )
  ) {
    return next(
      new AppError(
        "Trip is not available",
        400
      )
    );
  }

  const alreadyBooked =
    selectedSeats.some((seat) =>
      trip.bookedSeats.includes(seat)
    );

  if (alreadyBooked) {
    return next(
      new AppError(
        "Some selected seats are already booked",
        400
      )
    );
  }

  trip.bookedSeats.push(...selectedSeats);

  trip.availableSeats =
    14 - trip.bookedSeats.length;

  if (trip.availableSeats === 0) {
    trip.status = "full";
  }

  await trip.save();

  res.status(200).json({
    status: "success",
    message: "Seats booked successfully",
    data: {
      tripId: trip._id,
      bookedSeats: trip.bookedSeats,
      remainingSeats: trip.availableSeats,
    },
  });
});
export default {
    getAllTrips,
    getSingleTrip,
    createTrip,
    startTrip,
    completeTrip,
    updateTrip,
    cancelTrip,
    bookSeats
  };