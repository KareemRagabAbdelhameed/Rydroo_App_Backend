import mongoose from "mongoose";
import { setDayFromDate } from "../middlewares/setDayFromDate.js";
import mongooseI18n from "mongoose-i18n-localize";
import { locales } from "validator/lib/isIBAN.js";
const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
      i18n : true
    },

    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      i18n : true
    },

    date: {
      type: Date,
      required: [true, "Trip date is required"],
    },

    day: {
      type: String,
      enum: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      i18n : true
    },

    time: {
      type: String,
      required: [true, "Trip time is required"],
    },

    availableSeats: {
      type: Number,
      required: [true, "Available seats are required"],
      min: [0, "Seats cannot be negative"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },

    currency: {
      type: String,
      // required: true,
      enum: ["EGP"], 
      default: "EGP",
    },

    driverProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverProfile",
      required: true,
    },
    
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

setDayFromDate(tripSchema);

tripSchema.plugin(mongooseI18n,{
  locales : ["en","ar"],
  defaultLocale : "ar"
})

export default mongoose.model("Trip", tripSchema);
