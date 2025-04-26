import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  console.log("Received request:", req.method, req.body);

  await connectToDB();
  console.log("Connected to DB");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    hospital,
    registrarId,
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !role) {
    console.error("Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let roleApi = "";
    if (role === "doctor") roleApi = "/api/doctors";
    else if (role === "first-aid") roleApi = "/api/first-aid";
    else if (role === "registrar") roleApi = "/api/registrars";
    else return res.status(400).json({ error: "Invalid role" });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    console.log(`Fetching role data from: ${baseUrl}${roleApi}`);

    const roleRes = await fetch(`${baseUrl}${roleApi}`);
    console.log("Role API Response Status:", roleRes.status);

    if (!roleRes.ok) {
      return res.status(500).json({ error: `Failed to fetch ${role} data` });
    }

    const roleData = await roleRes.json();
    console.log("Fetched role data:", roleData);

    const matchedRecord = roleData.find((record) => record.email === email);
    if (!matchedRecord) {
      console.error(`No pre-registered ${role} found with this email`);
      return res
        .status(400)
        .json({ error: `No pre-registered ${role} found with this email` });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("User already registered:", email);
      return res.status(400).json({ error: "User already registered" });
    }

    // Hash the password
    console.log("Hashing password...");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Combine firstName and lastName into name
    const name = `${firstName} ${lastName}`;

    console.log("Creating new user...");
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      hospital,
      registrarId,
    });

    console.log("User created successfully:", newUser);
    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: `Failed to register user: ${error.message}` });
  }
}
