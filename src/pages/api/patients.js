import { connectToDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import MedicalRecord from "@/models/MedicalRecord";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or "http://localhost:49495" for Flutter web
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  await connectToDB();

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const {
        name,
        birthDate,
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
        !nationalId ||
        !diseaseName ||
        !diseaseDescription ||
        !medication ||
        !hospitalName ||
        !doctorName
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let patient = await Patient.findOne({ nationalId });

      if (!patient) {
        if (
          !birthDate ||
          !phone ||
          !address ||
          !gender ||
          !emergencyNumber ||
          !bloodType ||
          !password
        ) {
          return res.status(400).json({
            error: "Missing required fields for new patient registration",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        patient = new Patient({
          name,
          birthDate,
          phone,
          address,
          gender,
          emergencyNumber,
          bloodType,
          otherDisease,
          password: hashedPassword,
          nationalId,
          registeredBy,
          registrarHospital,
        });

        await patient.save();
      }

      const newMedicalRecord = new MedicalRecord({
        patientId: patient._id,
        nationalId,
        diseaseName,
        diseaseDescription,
        medication,
        hospitalName,
        doctorName,
      });

      await newMedicalRecord.save();

      res
        .status(201)
        .json({ message: "Patient registered or updated successfully" });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: error.message });
    }
    return;
  }

  if (req.method === "GET") {
    try {
      const patients = await Patient.find().select("-password");
      const patientsWithRecords = [];

      for (let patient of patients) {
        const medicalRecords = await MedicalRecord.find({
          patientId: patient._id,
        }).select("-patientId");
        const patientObject = patient.toObject();
        patientObject.medicalRecords = medicalRecords;
        patientsWithRecords.push(patientObject);
      }

      res.status(200).json(patientsWithRecords);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ error: error.message });
    }
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
