import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import cors from "cors";
import bcrypt from "bcrypt";

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

export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    console.log(`Invalid method: ${req.method}`);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, code, password } = req.body;

  console.log(`Received reset request: email=${email}, code=${code}`);

  if (!email || !code || !password) {
    console.log("Missing required fields");
    return res.status(400).json({ error: "Email, code, and password are required" });
  }

  try {
    await connectToDB();

    console.log(`Querying user with email: ${email}, code: ${code}`);
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: code.toString().trim(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log(`No valid reset code found for email: ${email}, code: ${code}`);
      // Additional debugging: Check if user exists and code/expiry status
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        console.log(`User found, but code invalid or expired. Stored code: ${userExists.resetPasswordToken}, expires: ${userExists.resetPasswordExpires}`);
      } else {
        console.log(`No user found for email: ${email}`);
      }
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    console.log(`Found user: ${email}, proceeding with password reset`);

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    try {
      await user.save();
      console.log(`Password reset successful for user: ${email}`);
    } catch (saveError) {
      console.error(`Failed to save new password for user: ${email}`, saveError);
      return res.status(500).json({ error: "Failed to save new password" });
    }

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Confirm reset password error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}