import { connectToDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*"); // Replace "*" with "http://localhost:49495" if needed (Flutter web port)
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  await connectToDB();

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const { nationalId, password } = req.body;

      if (!nationalId || !password) {
        res.status(400).json({ error: "Missing nationalId or password" });
        return;
      }

      const patient = await Patient.findOne({ nationalId });
      if (!patient || !(await bcrypt.compare(password, patient.password))) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      res.status(200).json({ message: "Login successful", nationalId });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
