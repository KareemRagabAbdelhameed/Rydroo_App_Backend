import Otp from "../models/otp.js";

export const sendOtpToEmail = async (email) => {
  console.log("Sending OTP to:", email);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // remove old OTPs
  await Otp.deleteMany({ email });

  // save OTP in Mongo (5 minutes)
  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "Rydroo",
        email: process.env.SUPPORT_EMAIL,
      },
      to: [{ email }],
      subject: "Verify your email",
      htmlContent: `
        <h2>Email Verification</h2>
        <h1>${otp}</h1>
        <p>This code expires in 5 minutes</p>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("BREVO API ERROR:", errorText);
    throw new Error("Failed to send OTP email");
  }

  console.log("✅ OTP email sent successfully");
};
