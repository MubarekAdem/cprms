import { connectToDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  await connectToDB();

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "PUT") {
    try {
      // Log the full request query for debugging
      console.log("Request query:", req.query);
      console.log("Request params:", req.params);

      // Extract nationalId, handling both cases
      const nationalId = req.query.nationalId || req.query.nationalid;
      const { password } = req.body;

      console.log("Received password update request:", {
        nationalId,
        password,
      });

      if (!nationalId) {
        return res
          .status(400)
          .json({ error: "Missing nationalId in request URL" });
      }
      if (!password) {
        return res
          .status(400)
          .json({ error: "Missing or empty password in request body" });
      }

      const patient = await Patient.findOne({ nationalId });
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      patient.password = hashedPassword;
      await patient.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
