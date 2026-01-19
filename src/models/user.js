import mongoose from "mongoose";
import validator from "validator"; // Import validator.js
import bcrypt from "bcryptjs";
import userRoles from "../utils/userRoles.js";

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: [8, "Password must be at least 8 characters long."],
      validate: {
        validator: function (value) {
          if (this.authProvider !== "local") return true; // skip validation
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          "Password must contain at least one lowercase, one uppercase, one number, and one special character.",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value), // Validate email format
        message: "Please provide a valid email address.",
      },
    },
    role : {
      type : String,
      enum : [userRoles.ADMIN, userRoles.USER, userRoles.DRIVER],
      default : userRoles.USER
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls
    },
    isVerified: { type: Boolean, default: false },
    authProvider: {
      type: String,
      enum: ["local", "google", "phone"],
      default: "local",
    },
    refreshTokens: [refreshTokenSchema],
  },
  {
    timestamps: true,
  }
);
 
// Pre-save hook to automatically set the age group and hash the password
userSchema.pre("save", async function (next) {
  try {
    // Hash password if modified
    if (this.isModified("password")) {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }

    next();
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false; // Prevent crash for OAuth users
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
