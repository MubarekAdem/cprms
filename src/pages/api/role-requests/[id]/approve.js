import { connectToDB } from "@/lib/mongodb";
import RoleRequest from "@/models/RoleRequest";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
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

  if (req.method === "PUT") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || (session.user.role && session.user.role !== "None")) {
        console.error(
          `Unauthorized PUT attempt by user: ${
            session?.user?.email || "unknown"
          }, role: ${session?.user?.role}`
        );
        return res.status(403).json({ error: "Unauthorized" });
      }

      console.log(`Attempting to approve role request ${id}`);
      const roleRequest = await RoleRequest.findById(id).populate(
        "user",
        "name email"
      );
      if (!roleRequest) {
        console.error(`Role request not found for ID: ${id}`);
        return res
          .status(404)
          .json({ error: `Role request not found for ID: ${id}` });
      }
      if (roleRequest.status !== "pending") {
        console.error(
          `Role request ${id} is not pending, current status: ${roleRequest.status}`
        );
        return res
          .status(400)
          .json({
            error: `Role request is not pending, current status: ${roleRequest.status}`,
          });
      }

      roleRequest.status = "approved";
      await roleRequest.save();
      console.log(
        `Approved role request ${id} for user ${
          roleRequest.user?._id || "unknown"
        }`
      );

      if (roleRequest.user?._id) {
        const user = await User.findByIdAndUpdate(
          roleRequest.user._id,
          { $set: { role: roleRequest.requestedRole } },
          { new: true }
        );

        if (!user) {
          console.warn(
            `User not found for ID: ${roleRequest.user._id}, proceeding with approval`
          );
        }
      } else {
        console.warn(
          `No user associated with role request ${id}, proceeding with approval`
        );
      }

      return res.status(200).json({ message: "Role request approved" });
    } catch (error) {
      console.error("Error approving role request:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
