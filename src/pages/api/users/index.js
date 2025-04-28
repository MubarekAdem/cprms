import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import cors from "cors";

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: "*", // Adjust for production (e.g., your Flutter app’s URL)
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDB();
    const users = await User.find({}, { password: 0 }); // Exclude password field
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
