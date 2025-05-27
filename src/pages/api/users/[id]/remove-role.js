import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import FirstAid from "@/models/FirstAid";
import Registrar from "@/models/Registrar";
import RoleRequest from "@/models/RoleRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req, res) {
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

      const { role } = req.body;
      if (
        !role ||
        !["admin", "doctor", "first-aid", "registrar"].includes(role)
      ) {
        console.error(`Invalid role provided: ${role}`);
        return res.status(400).json({ error: "Invalid role specified" });
      }

      console.log(`Attempting to remove ${role} role for user ${id}`);
      const user = await User.findById(id);
      if (!user) {
        console.error(`User not found for ID: ${id}`);
        return res.status(404).json({ error: `User not found for ID: ${id}` });
      }
      if (user.role !== role) {
        console.error(
          `User ${id} does not have role ${role}, current role: ${user.role}`
        );
        return res.status(400).json({
          error: `User does not have role ${role}, current role: ${user.role}`,
        });
      }

      // Update the user's role to "None"
      user.role = "None";
      await user.save();
      console.log(`Updated user ${id} role to None`);

      // Remove the corresponding record from the role-specific collection using email
      let deletedCount = 0;
      if (role === "doctor") {
        const result = await Doctor.deleteOne({
          $or: [
            { email: user.email }, // Common field name
            { userEmail: user.email }, // Alternative field name
          ],
        });
        deletedCount = result.deletedCount;
        console.log(
          `Queried Doctors collection with { email: ${user.email}, userEmail: ${user.email} }`
        );
        if (deletedCount === 0) {
          console.warn(`No Doctor record found for email ${user.email}`);
          // Fetch all Doctor records to debug
          const allDoctors = await Doctor.find({});
          console.log(
            `Current Doctors collection: ${JSON.stringify(allDoctors, null, 2)}`
          );
        }
      } else if (role === "first-aid") {
        const result = await FirstAid.deleteOne({
          $or: [{ email: user.email }, { userEmail: user.email }],
        });
        deletedCount = result.deletedCount;
        console.log(
          `Queried FirstAid collection with { email: ${user.email}, userEmail: ${user.email} }`
        );
        if (deletedCount === 0) {
          console.warn(`No FirstAid record found for email ${user.email}`);
          const allFirstAid = await FirstAid.find({});
          console.log(
            `Current FirstAid collection: ${JSON.stringify(
              allFirstAid,
              null,
              2
            )}`
          );
        }
      } else if (role === "registrar") {
        const result = await Registrar.deleteOne({
          $or: [{ email: user.email }, { userEmail: user.email }],
        });
        deletedCount = result.deletedCount;
        console.log(
          `Queried Registrars collection with { email: ${user.email}, userEmail: ${user.email} }`
        );
        if (deletedCount === 0) {
          console.warn(`No Registrar record found for email ${user.email}`);
          const allRegistrars = await Registrar.find({});
          console.log(
            `Current Registrars collection: ${JSON.stringify(
              allRegistrars,
              null,
              2
            )}`
          );
        }
      }
      console.log(
        `Deleted ${deletedCount} record(s) from ${role} collection for email ${user.email}`
      );

      // Clean up any pending RoleRequest documents for this user
      const deletedRequests = await RoleRequest.deleteMany({
        user: id,
        status: "pending",
      });
      console.log(
        `Deleted ${deletedRequests.deletedCount} pending role requests for user ${id}`
      );

      return res.status(200).json({
        message: `${
          role.charAt(0).toUpperCase() + role.slice(1)
        } role removed successfully`,
      });
    } catch (error) {
      console.error(`Error removing ${req.body.role} role:`, error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
