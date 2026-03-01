import "dotenv/config";
import Stripe from "stripe";
import Trip from "../models/tripModel.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { tripId , seats } = req.body;

    // 1️⃣ نجيب الرحلة
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 2️⃣ نتأكد إنها متاحة
    if (trip.status !== "active") {
      return res.status(400).json({ message: "Trip is not available" });
    }

    if (trip.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    const totalAmount = trip.price * seats;

    // 3️⃣ ننشئ PaymentIntent بالسعر الحقيقي
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // مهم جداً
      currency: trip.currency.toLowerCase(), // Stripe بيحب lowercase
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tripId: trip._id.toString(),
        seats : seats.toString(),
        driverId: trip.driverProfile.toString(),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { createPaymentIntent };