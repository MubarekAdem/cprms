import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      await connectToDB();
      const user = await User.findOne({ email }).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }

  if (req.method === "PUT") {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      await connectToDB();

      const { firstName, lastName, phone, email } = req.body;

      // Validate input
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Find the user by email to check role
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user is admin or super admin
      if (!["admin", "super-admin"].includes(user.role)) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update profile" });
      }

      // Update the user
      const updatedUser = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            firstName,
            lastName,
            phone: phone || "",
            updatedAt: new Date(),
          },
        },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }

      // Return the updated user data
      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
