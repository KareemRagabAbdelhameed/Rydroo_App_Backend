import Otp from "../models/otp.js";
import nodemailer from "nodemailer";

export const sendOtpToEmail = async (email) => {
  console.log("========== OTP FLOW START ==========");
  console.log("Target email:", email);
  console.log("ENV CHECK:", {
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "SET" : "MISSING",
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    NODE_ENV: process.env.NODE_ENV,
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);

  await Otp.deleteMany({ email });
  console.log("Old OTPs deleted");

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
  console.log("OTP saved to Mongo");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  // 🔍 Verify SMTP connection
  try {
    await transporter.verify();
    console.log("SMTP connection verified");
  } catch (err) {
    console.error("SMTP VERIFY FAILED:", err);
    throw err;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Rydroo" <${process.env.SUPPORT_EMAIL}>`,
      to: email,
      subject: "Verify your email",
      text: `Your OTP is ${otp}`,
    });

    console.log("EMAIL SENT SUCCESS:", info.response);
  } catch (err) {
    console.error("SEND MAIL FAILED:", err);
    throw err;
  }

  console.log("=========== OTP FLOW END ===========");
};
