// api/chat-ai.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust for Flutter web if needed
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  await connectToDB();

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, nationalId } = req.body;

  if (!message || !nationalId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const patient = await Patient.findOne({ nationalId });
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const formattedMedicalRecords = (patient.medicalRecords || [])
      .map(
        (record) => `
        Disease: ${record.diseaseName}
        Description: ${record.diseaseDescription}
        Medication: ${record.medication}
        Hospital: ${record.hospitalName}
        Date: ${new Date(record.dateAdded).toLocaleDateString()}
      `
      )
      .join("\n");

    const prompt = `
            If you are aksed normal non medical question response with normal related answer otherwise if you are asked medical questions
      You are a medical AI assistant with expertise in disease diagnosis and treatment.
      
      Patient Information:
      Name: ${patient.name}
      Birth Date: ${patient.birthDate}
      Gender: ${patient.gender}
      Blood Type: ${patient.bloodType}
      Address: ${patient.address}
      Emergency Contact: ${patient.emergencyNumber}
      Other Diseases: ${patient.otherDisease}
      
      Medical History:
      ${formattedMedicalRecords}

      Please provide a highlight very simple not more than 2 paragraphs response to the askers query: ${message}
      
      Consider the patient's complete medical history, current medications, and any potential drug interactions when answering.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("Error in AI request:", error);
    return res
      .status(500)
      .json({ error: `AI request failed: ${error.message}` });
  }
}
