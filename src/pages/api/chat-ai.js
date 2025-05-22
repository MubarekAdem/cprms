import { GoogleGenerativeAI } from "@google/generative-ai"; // Ensure this import is present

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, patientData } = req.body;

  if (!message || !patientData) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use Gemini 1.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated to use Gemini 1.5 Flash model

    const formattedMedicalRecords = patientData.medicalRecords
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
        You are a medical AI assistant with expertise in disease diagnosis and treatment.
        
        Patient Information:
        Name: ${patientData.name}
        Birth Date: ${patientData.birthDate}
        Gender: ${patientData.gender}
        Blood Type: ${patientData.bloodType}
        Address: ${patientData.address}
        Emergency Contact: ${patientData.emergencyNumber}
        Other Diseases: ${patientData.otherDisease}
        
        Medical History:
        ${formattedMedicalRecords}
  
        only if you asked medical related questions , Please provide a highlight very simple not more than 2 paragraphs response to the doctor's query: ${message},
        If you are aksed normal non medical question response with normal related answer otherwise if you are asked medical questions
        also if you asked very simple question repsonse with straight forward simple answer , like if you asked "hi" , response with "Hi How can i help you " ald similar to that if you asked other non medical questions reponse with apropirate equal level responses.
        Consider the patient's complete medical history, current medications, and any potential drug interactions when answering.
      `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("Error in AI request:", error); // Log the actual error
    return res
      .status(500)
      .json({ error: `AI request failed: ${error.message}` });
  }
}
