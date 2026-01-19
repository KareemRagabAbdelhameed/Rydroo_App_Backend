import User from "../models/user.js";
import sendError from "../utils/sendError.js";
import generateAndSetTokens from "../utils/generateAndSetTokens.js";
import clearCookies from "../utils/clearCookies.js";
import validateUser from "../utils/validateUser.js";
import singleDeviceLogout from "../utils/singleDeviceLogout.js";
import Otp from "../models/otp.js";
import { sendOtpToEmail } from "../utils/sendOtpToEmail.js";

// User signup
const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password,role } = req.body;

    const emailLower = email?.toLowerCase();

    const oldUser = await User.findOne({ email: emailLower });
    if (oldUser) return next(sendError(409, "userExists"));

    const user = new User({
      firstName,
      lastName,
      email: emailLower,
      password,
      role
    });

    await user.save();

    // 🔐 Send OTP (non-blocking)
    try {
      await sendOtpToEmail(emailLower);
    } catch (err) {
      console.error("OTP email failed:", err.message);
    }

    return res.status(201).json({
      message: "User registered! Please verify your email.",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role : user.role
      },
    });
  } catch (err) {
    next(err);
  }
};


// User logout
const logout = async (req, res, next) => {
  const user = await validateUser(req, next);

  const refreshToken = req.cookies.refresh_token;

  // Remove the refresh tokens from the user's array
  await singleDeviceLogout(refreshToken, user);

  // Clear authentication cookies
  clearCookies(res);

  return res.status(200).json({
    message: "Successfully logged out",
  });
};


const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Missing fields" });

    const emailLower = email.toLowerCase();

    const record = await Otp.findOne({ email: emailLower, otp });
    if (!record)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // remove OTP
    await Otp.deleteMany({ email: emailLower });

    // verify user
    await User.updateOne(
      { email: emailLower },
      { $set: { isVerified: true } }
    );

    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};


export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Email is required" });

  const emailLower = email.toLowerCase();

  const lastOtp = await Otp.findOne({ email: emailLower }).sort({
    createdAt: -1,
  });

  if (lastOtp && Date.now() - lastOtp.createdAt < 60 * 1000) {
    return res
      .status(429)
      .json({ message: "Please wait before requesting another OTP" });
  }

  await sendOtpToEmail(emailLower);

  return res.json({ message: "OTP sent if account exists" });
};


// User login
const login = async (req, res, next) => {
  const userId = req.user?.id;

  if (userId) {
    return res.status(200).json({
      message: "User is already logged in.",
    });
  }

  const { email, password } = req.body;

  if (!email || !password) return next(sendError(400, "missingFields"));

  const user = await User.findOne({ email });

  if (!user) return next(sendError(404, "user"));

  // Compare the password with the hashed password in the database
  const isMatch = await user.comparePassword(password);

  if (!isMatch) return next(sendError(401, "Invalidcardinalities"));

  if (!user.isVerified) return next(sendError(403, "verifyEmail"));

  // Generate and set tokens
  await generateAndSetTokens(user, res);

  return res.status(200).json({
    message: "User successfully logged In",
    data: {
      user: {
        firstName: user.firstName,
        lastName:user.lastName,
        email: user.email,
        id: user._id,
        role : user.role
      },
      
    },
  });
};

export default { signup, login, logout, verifyOtp, resendOtp };