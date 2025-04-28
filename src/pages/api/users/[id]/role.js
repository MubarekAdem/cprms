import mongoose from "mongoose";
import User from "@/models/User"; // Adjust the path to your User model

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      const { id } = req.query;
      const { role } = req.body;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Validate role (optional, but recommended)
      const validRoles = [
        "None",
        "admin",
        "doctor",
        "first-aid",
        "registrar",
        "super-admin",
      ];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Update only the role field using $set, without running full validators
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { role } },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
