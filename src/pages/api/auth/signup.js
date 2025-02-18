import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Received Data:", req.body); // Debugging: Check received data

  const { firstName, lastName, email, phone, password } = req.body;

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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name: `${firstName} ${lastName}`, // Combine first and last name
    email,
    phone,
    password: hashedPassword,
    role: "None",
  });

  await newUser.save();
  res.status(201).json({ message: "User created successfully" });
}
