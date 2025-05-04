import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import cors from "cors";
import nodemailer from "nodemailer";

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: "*", // Adjust for production
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
});

// Helper to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    console.log(`Invalid method: ${req.method}`);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    console.log("Missing email field");
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    await connectToDB();
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`No user found for email: ${email}`);
      return res.status(404).json({ error: "Email not found" });
    }

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

    console.log(`Generated reset code: ${resetCode}, expires: ${expires}`);

    // Update user document with resetPasswordToken
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = expires;

    try {
      await user.save();
      console.log(
        `Successfully saved reset code for user: ${email}, code: ${resetCode}, expires: ${expires}`
      );
      // Verify the save operation
      const updatedUser = await User.findOne({ email: email.toLowerCase() });
      console.log(
        `Verified user document: resetPasswordToken=${updatedUser.resetPasswordToken}, resetPasswordExpires=${updatedUser.resetPasswordExpires}`
      );
    } catch (saveError) {
      console.error(`Failed to save reset code for user: ${email}`, saveError);
      return res.status(500).json({ error: "Failed to save reset code" });
    }

    // Send email with reset code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      html: `
        <h2>Password Reset Code</h2>
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `Password reset code sent to: ${email}, Message ID: ${info.messageId}`
      );
    } catch (emailError) {
      console.error(`Failed to send email to ${email}:`, emailError);
      return res.status(500).json({ error: "Failed to send reset code email" });
    }

    return res.status(200).json({ message: "Password reset code sent" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
