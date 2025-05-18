import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await connectToDB();

    // First find the user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", {
      email: user.email,
      storedToken: user.resetPasswordToken,
      receivedOTP: otp,
      expiryTime: user.resetPasswordExpires,
      currentTime: new Date(),
    });

    // Check if OTP exists and matches
    if (!user.resetPasswordToken) {
      console.log("No reset token found for user");
      return res
        .status(400)
        .json({ error: "No reset code found. Please request a new one" });
    }

    // Check if OTP matches
    if (user.resetPasswordToken !== otp.toString().trim()) {
      console.log("Token mismatch:", {
        stored: user.resetPasswordToken,
        received: otp,
      });
      return res.status(400).json({ error: "Invalid reset code" });
    }

    // Check if OTP is expired
    if (
      !user.resetPasswordExpires ||
      new Date() > new Date(user.resetPasswordExpires)
    ) {
      console.log("Token expired:", {
        expiryTime: user.resetPasswordExpires,
        currentTime: new Date(),
      });
      return res
        .status(400)
        .json({ error: "Reset code has expired. Please request a new one" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear reset token fields
    await User.updateOne(
      { email: email.toLowerCase() },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      }
    );

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
