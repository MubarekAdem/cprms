import { connectToDB } from "@/lib/mongodb";
import RoleRequest from "@/models/RoleRequest";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user.role !== "super-admin") {
        console.error(
          `Unauthorized POST attempt by user: ${
            session?.user?.email || "unknown"
          }`
        );
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { userId, requestedRole } = req.body;
      if (!userId || !requestedRole) {
        console.error(
          `Missing userId or requestedRole in POST: ${JSON.stringify(req.body)}`
        );
        return res
          .status(400)
          .json({ error: "Missing userId or requestedRole" });
      }

      const user = await User.findById(userId);
      if (!user) {
        console.error(`User not found for ID: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }

      const existingRequest = await RoleRequest.findOne({
        user: userId,
        requestedRole,
        status: "pending",
      });
      if (existingRequest) {
        console.log(
          `Returning existing pending request for user ${userId}, role ${requestedRole}`
        );
        return res.status(200).json(existingRequest);
      }

      const roleRequest = new RoleRequest({
        user: userId,
        requestedRole,
        status: "pending",
      });
      await roleRequest.save();
      console.log(
        `Created new role request: ${roleRequest._id} for user ${userId}`
      );

      return res.status(201).json(roleRequest);
    } catch (error) {
      console.error("Error creating role request:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (
        !session ||
        (session.user.role !== "None" &&
          session.user.role !== "super-admin" &&
          session.user.role !== "first-aid")
      ) {
        console.error(
          `Unauthorized GET attempt by user: ${
            session?.user?.email || "unknown"
          }, role: ${session?.user?.role}`
        );
        return res.status(403).json({ error: "Unauthorized" });
      }

      let query = { status: "pending" };
      if (session.user.role === "None") {
        query.user = session.user.id;
      }

      const requests = await RoleRequest.find(query)
        .populate("user", "name email")
        .lean();
      console.log(
        `Fetched ${requests.length} pending role requests for user ${session?.user?.email}`
      );
      return res.status(200).json(requests);
    } catch (error) {
      console.error("Error fetching role requests:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
