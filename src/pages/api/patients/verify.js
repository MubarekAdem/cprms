import { connectToDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*"); // Replace "*" with your Flutter app's origin if needed
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  await connectToDB();

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const { nationalId } = req.body;

      if (!nationalId) {
        res.status(400).json({ error: "Missing nationalId" });
        return;
      }

      const patient = await Patient.findOne({ nationalId });
      if (!patient) {
        res.status(404).json({ error: "National ID not found" });
        return;
      }

      res.status(200).json({ message: "National ID verified", nationalId });
    } catch (error) {
      console.error("Verify National ID Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
