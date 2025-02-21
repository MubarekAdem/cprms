import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName, email, phone, password, role } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let roleApi = "";
    if (role === "doctor") roleApi = "/api/doctors";
    else if (role === "first-aid") roleApi = "/api/first-aid";
    else if (role === "registrar") roleApi = "/api/registrars";
    else return res.status(400).json({ error: "Invalid role" });

    // Ensure we are using the correct base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const roleRes = await fetch(`${baseUrl}${roleApi}`);

    if (!roleRes.ok) {
      return res.status(500).json({ error: `Failed to fetch ${role} data` });
    }

    const roleData = await roleRes.json();
    const matchedRecord = roleData.find((record) => record.email === email);

    if (!matchedRecord) {
      return res
        .status(400)
        .json({ error: `No pre-registered ${role} found with this email` });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Create new user with role
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password, // Ensure hashing in production
      role,
    });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Failed to register user: ${error.message}` });
  }
}
