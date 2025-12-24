import Trip from "../models/tripModel.js"
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";

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

 const getAllTrips = async(req,res)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page-1)*limit;
    
    const trips =await Trip.find({status : "active"},{"__v":false}).limit(limit).skip(skip);
    res.json({status : "Success",data : {
        trips
    }});
}
const getSingleTrip = catchAsync(async(req,res,next)=>{
    const {tripId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(tripId)){
        return next(new AppError("Invalid trip ID format",400));
    }

    const trip =await Trip.findById(tripId);
    if(!trip){
        return next(new AppError("Trip not found",404))
    }

    res.status(200).json({
        status : "success",
        data : trip
    })
})
const createTrip = catchAsync(async(req,res,next)=>{
    const {
        source,
        destination,
        date,
        time,
        availableSeats,
        price,
        currency,
      } = req.body;
      if (!source ||!destination ||!date ||!time ||availableSeats === undefined ||price === undefined){
        return next(new AppError("All trip fields are required",400));
      }
      if (availableSeats <= 0) {
        return next(
          new AppError("Available seats must be greater than zero", 400)
        );
      }
    
      if (price <= 0) {
        return next(new AppError("Trip price must be greater than zero", 400));
      }
    //   check if the trip already exist
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

      const trip = await Trip.create({source,date,destination,price,time,availableSeats,currency});

      res.status(200).json({
        status : "success",
        message : "trip created successfully",
        data : trip,
      })
})

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