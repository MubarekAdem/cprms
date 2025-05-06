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

      return res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture || "",
        role: user.role,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }

  if (req.method === "PUT") {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session) {
        console.log("No session found");
        return res.status(401).json({ error: "Not authenticated" });
      }

      console.log("Session user:", session.user);
      console.log("Request body:", req.body);

      await connectToDB();

      const { firstName, lastName, phone, email, profilePicture } = req.body;

      if (!email) {
        console.log("Email missing in request body");
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(404).json({ error: "User not found" });
      }

      if (session.user.email !== email) {
        console.log(
          "Session email does not match request email:",
          session.user.email,
          email
        );
        return res.status(403).json({ error: "Unauthorized: Email mismatch" });
      }

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone || "";
      if (profilePicture !== undefined)
        updateData.profilePicture = profilePicture;

      if (Object.keys(updateData).length === 0) {
        console.log("No fields to update");
        return res.status(400).json({ error: "No updates provided" });
      }

      updateData.updatedAt = new Date();
      console.log("Updating user with data:", updateData);

      const updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        console.log("Failed to update user");
        return res.status(500).json({ error: "Failed to update user" });
      }

      console.log("Updated user:", updatedUser);

      // Verify the update in the database
      const verifiedUser = await User.findOne({ email }).select("-password");
      console.log("Verified user after update:", verifiedUser);

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profilePicture: updatedUser.profilePicture || "",
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
