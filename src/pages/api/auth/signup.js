import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Received Data:", req.body); // Debugging: Check received data

  const { firstName, lastName, email, phone, password } = req.body;

  // Validate that all fields are provided
  if (!firstName || !lastName || !email || !phone || !password) {
    console.log("Missing fields:", {
      firstName,
      lastName,
      email,
      phone,
      password,
    });
    return res.status(400).json({ error: "All fields are required" });
  }

  await connectToDB();

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user with separate first and last names
  const newUser = new User({
    firstName, // Save firstName as-is
    lastName, // Save lastName as-is
    email,
    phone,
    password: hashedPassword,
    role: "None",
  });

  try {
    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
