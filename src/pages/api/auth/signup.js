import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationOTP, verifyOTP } from "@/lib/otp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { firstName, lastName, email, phone, password, otp } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await connectToDB();

    // Check if user already exists with this email or phone
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already registered" });
      }
      if (existingUser.phone === phone) {
        return res
          .status(400)
          .json({ error: "Phone number already registered" });
      }
    }

    // If OTP is provided, verify it
    if (otp) {
      try {
        await verifyOTP(email, otp);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        password: hashedPassword,
        isVerified: true,
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } else {
      // If no OTP provided, send verification email
      await sendVerificationOTP(email);
      return res.status(200).json({
        message: "OTP sent to your email",
        requiresOTP: true,
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
