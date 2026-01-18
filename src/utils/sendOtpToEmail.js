import Otp from "../models/otp.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // IMPORTANT
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtpToEmail = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // delete old OTPs
  await Otp.deleteMany({ email });

  // save new OTP (5 min)
  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  // send email
  await transporter.sendMail({
    from: `"Rydroo" <${process.env.SUPPORT_EMAIL}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes</p>
    `,
  });
};
