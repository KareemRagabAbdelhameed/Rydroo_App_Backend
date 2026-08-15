import nodemailer from "nodemailer";
import Otp from "../models/otp.js";

async function sendViaBrevoApi(email, otp) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.SUPPORT_EMAIL?.trim();

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }
  if (!senderEmail) {
    throw new Error("SUPPORT_EMAIL is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "Rydroo",
        email: senderEmail,
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
    throw new Error(`Failed to send OTP via Brevo API: ${response.status}`);
  }
}

async function sendViaBrevoSmtp(email, otp) {
  const user = process.env.BREVO_SMTP_USER?.trim();
  const pass = process.env.BREVO_SMTP_PASS?.trim();
  const from = process.env.SUPPORT_EMAIL?.trim() || user;

  if (!user || !pass) {
    throw new Error("BREVO_SMTP_USER / BREVO_SMTP_PASS are not configured");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Rydroo" <${from}>`,
    to: email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}. It expires in 5 minutes.`,
    html: `
      <h2>Email Verification</h2>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes</p>
    `,
  });
}

export const sendOtpToEmail = async (email) => {
  console.log("Sending OTP to:", email);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  try {
    await sendViaBrevoApi(email, otp);
    console.log("✅ OTP email sent successfully via Brevo API");
    return;
  } catch (apiError) {
    console.error("Brevo API send failed:", apiError.message);
    console.log("Falling back to Brevo SMTP...");
  }

  await sendViaBrevoSmtp(email, otp);
  console.log("✅ OTP email sent successfully via Brevo SMTP");
};
