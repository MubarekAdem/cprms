import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDB();

    // Fetch all users with role 'admin'
    const admins = await User.find({ role: "admin" })
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    return res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
}
