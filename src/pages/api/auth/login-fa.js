import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import cors from "cors";

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: "*", // Allow all origins (adjust for production, e.g., 'http://your-app-domain.com')
  methods: ["GET", "POST", "OPTIONS"], // Allow POST and OPTIONS
  allowedHeaders: ["Content-Type", "Accept"], // Allow required headers
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
  // Apply CORS middleware
  await runMiddleware(req, res, corsMiddleware);

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    await connectToDB();
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`No user found for email: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log(`Verifying password for user: ${email}`);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for email: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Return user data (exclude password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospital: user.hospital,
      registrarId: user.registrarId,
    };

    console.log(`Login successful for user: ${email}`);
    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
