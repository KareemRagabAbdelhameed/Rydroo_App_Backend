import User from "../models/user.js";
import sendError from "../utils/sendError.js";
import generateAndSetTokens from "../utils/generateAndSetTokens.js";
import clearCookies from "../utils/clearCookies.js";
import validateUser from "../utils/validateUser.js";
import  { sendOtpToEmail, otpStore, resendMeta, RESEND_COOLDOWN_MS, RESEND_MAX_PER_HOUR } from "../utils/sendOtp.js";
import singleDeviceLogout from "../utils/singleDeviceLogout.js";

// User signup
const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const emailLower = email?.toLowerCase();

    const oldUser = await User.findOne({ email: emailLower });
    if (oldUser) return next(sendError(409, "userExists"));

    const user = new User({
      firstName,
      lastName,
      email: emailLower,
      password,
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
    if (!email || !otp) return next(sendError(400, "missingFields"));

    const emailLower = email.toLowerCase();
    const record = otpStore.get(emailLower);

    if (!record) {
      return res.status(400).json({
        message: "No OTP found. Please request a new one.",
      });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(emailLower);
      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // ✅ OTP valid
    otpStore.delete(emailLower);

    const user = await User.findOne({ email: emailLower });
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    return res.json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    next(err);
  }
};


const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const emailLower = email.toLowerCase();
    const now = Date.now();

    const meta = resendMeta.get(emailLower) || {
      lastSent: 0,
      count: 0,
      windowStart: now,
    };

    // ⏳ Cooldown
    if (now - meta.lastSent < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - meta.lastSent)) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${wait}s before requesting another OTP.`,
      });
    }

    // 🕐 Reset hourly window
    if (now - meta.windowStart > 60 * 60 * 1000) {
      meta.count = 0;
      meta.windowStart = now;
    }

    if (meta.count >= RESEND_MAX_PER_HOUR) {
      return res.status(429).json({
        message: "Too many resend attempts. Try again later.",
      });
    }

    // 📧 Send OTP (NON-BLOCKING)
    try {
      await sendOtpToEmail(emailLower);
    } catch (err) {
      console.error("Resend OTP failed:", err.message);
    }

    meta.lastSent = now;
    meta.count += 1;
    resendMeta.set(emailLower, meta);

    // ✅ Generic response (security)
    return res.json({
      message: "If an account exists, an OTP has been sent.",
    });
  } catch (err) {
    next(err);
  }
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
      },
    },
  });
};

export default { signup, login, logout, verifyOtp, resendOtp };