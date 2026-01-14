import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";

import userRoutes from "./routes/userRoutes.js";
import tripRoutes from "./routes/tripRoutes.js"
import AppError from "./utils/AppError.js";
import globalError from "./middlewares/globalError.js";

import { fileURLToPath } from "url";
import { error } from "console";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve frontend (static files)
app.use(express.static(path.join(__dirname, "client", "dist")));

app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173", // Local development
  "https://rydroo.onrender.com",
  "htttps://rydroo.vercel.app",
  "https://rydroo-git-main-kareemragababdelhameeds-projects.vercel.app/"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// Security Enhancements
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "https://accounts.google.com",
        "https://cdn.jsdelivr.net",
        "https://cdn.socket.io",
      ],
      "frame-src": ["https://accounts.google.com"],
      "img-src": ["*"],
      "connect-src": [
        "'self'",
        "https://api.cloudinary.com",
        "https://rydroo.onrender.com",
      ],
    },
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB:", err.message));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use("/user", userRoutes);
app.use("/trips",tripRoutes);
// app.all("*",(req,res,next)=>{
//   next(new AppError(`cannot find this route : ${req.originalUrl}`,400));
// })
// Default API Home Route
app.get("/", (req, res) => {
  res.send("Welcome to the iSharee Backend!");
});



// Frontend Fallback (for React/Vue/SPA)
// Use a regex route to avoid path-to-regexp parsing issues with the literal "*" string
 app.get(/.*/, (req, res) => {
   res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
 });

// // Handle Invalid API Routes
// app.all("*", (req, res, next) => {
//   next(new AppError("Cannot find this route", 404));
// });

// Global Error Handling (must be last)
app.use(globalError);

export default app;
