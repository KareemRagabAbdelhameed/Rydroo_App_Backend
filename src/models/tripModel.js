import mongoose from "mongoose";
import { setDayFromDate } from "../middlewares/setDayFromDate.js";

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
    },

    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
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
      required: true,
      enum: ["EGP"], 
      default: "EGP",
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

export default mongoose.model("Trip", tripSchema);
