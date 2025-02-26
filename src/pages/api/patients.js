import { connectToDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import MedicalRecord from "@/models/MedicalRecord";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    try {
      console.log("Received Request:", req.body);

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
        console.log("Missing Required Fields:", req.body);
        return res.status(400).json({ error: "Missing required fields" });
      }

      let patient = await Patient.findOne({ nationalId });

      if (!patient) {
        console.log("Registering new patient:", nationalId);

        if (
          !birthDate ||
          !phone ||
          !address ||
          !gender ||
          !emergencyNumber ||
          !bloodType ||
          !password
        ) {
          console.log("Missing new patient fields:", req.body);
          return res
            .status(400)
            .json({
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
        console.log("New patient saved:", patient);
      }

      console.log("Adding Medical Record for:", patient._id);

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
      console.log("Medical Record saved:", newMedicalRecord);

      return res
        .status(201)
        .json({ message: "Patient registered or updated successfully" });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const patients = await Patient.find().select("-password");
      return res.status(200).json(patients);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
