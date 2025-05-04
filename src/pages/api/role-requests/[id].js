import { connectToDB } from "@/lib/mongodb";
import RoleRequest from "@/models/RoleRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req, res) {
  // Ensure JSON response for all cases
  res.setHeader("Content-Type", "application/json");

  await connectToDB();

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`Invalid request ID: ${id}`);
    return res.status(400).json({ error: "Invalid request ID" });
  }

  if (req.method === "DELETE") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || (session.user.role && session.user.role !== "None")) {
        console.error(
          `Unauthorized DELETE attempt by user: ${
            session?.user?.email || "unknown"
          }, role: ${session?.user?.role}`
        );
        return res.status(403).json({ error: "Unauthorized" });
      }

      console.log(`Attempting to reject role request ${id}`);
      const roleRequest = await RoleRequest.findByIdAndDelete(id);
      if (!roleRequest) {
        console.error(`Role request not found for ID: ${id}`);
        return res
          .status(404)
          .json({ error: `Role request not found for ID: ${id}` });
      }
      console.log(`Rejected role request ${id}`);

      return res.status(200).json({ message: "Role request rejected" });
    } catch (error) {
      console.error("Error rejecting role request:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
