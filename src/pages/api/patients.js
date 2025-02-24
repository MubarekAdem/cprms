import { connectToDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    try {
      const {
        name,
        age,
        phone,
        address,
        gender,
        emergencyNumber,
        bloodType,
        otherDisease,
        password,
        diseaseName,
        diseaseDescription,
        medication,
        hospitalName,
        doctorName,
        nationalId,
        registeredBy,
        registrarHospital,
      } = req.body;

      if (
        !name ||
        !age ||
        !phone ||
        !address ||
        !gender ||
        !emergencyNumber ||
        !bloodType ||
        !password ||
        !diseaseName ||
        !diseaseDescription ||
        !medication ||
        !hospitalName ||
        !doctorName ||
        !nationalId ||
        !registeredBy ||
        !registrarHospital
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const newPatient = new Patient({
        name,
        age,
        phone,
        address,
        gender,
        emergencyNumber,
        bloodType,
        otherDisease,
        password: hashedPassword,
        diseaseName,
        diseaseDescription,
        medication,
        hospitalName,
        doctorName,
        nationalId,
        registeredBy,
        registrarHospital,
      });

      await newPatient.save();
      return res
        .status(201)
        .json({ message: "Patient registered successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
