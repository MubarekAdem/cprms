import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import RoleRequest from "@/models/RoleRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req, res) {
  // Ensure JSON response for all cases
  res.setHeader("Content-Type", "application/json");

  await connectToDB();

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`Invalid user ID: ${id}`);
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (req.method === "PUT") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user.role !== "super-admin") {
        console.error(
          `Unauthorized PUT attempt by user: ${
            session?.user?.email || "unknown"
          }, role: ${session?.user?.role}`
        );
        return res.status(403).json({ error: "Unauthorized" });
      }

      console.log(`Attempting to remove admin role for user ${id}`);
      const user = await User.findById(id);
      if (!user) {
        console.error(`User not found for ID: ${id}`);
        return res.status(404).json({ error: `User not found for ID: ${id}` });
      }
      if (user.role !== "admin") {
        console.error(`User ${id} is not an admin, current role: ${user.role}`);
        return res
          .status(400)
          .json({ error: `User is not an admin, current role: ${user.role}` });
      }

      user.role = "None";
      await user.save();
      console.log(`Removed admin role for user ${id}`);

      // Clean up any pending RoleRequest documents for this user
      const deletedRequests = await RoleRequest.deleteMany({
        user: id,
        status: "pending",
      });
      console.log(
        `Deleted ${deletedRequests.deletedCount} pending role requests for user ${id}`
      );

      return res
        .status(200)
        .json({ message: "Admin role removed successfully" });
    } catch (error) {
      console.error("Error removing admin role:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
