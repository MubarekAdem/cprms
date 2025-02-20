import { connectToDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    const { name, email, phone, role, hospital, doctorId, proofDocument } =
      req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !role ||
      !hospital ||
      !doctorId ||
      !proofDocument
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newDoctor = await Doctor.create({
        name,
        email,
        phone,
        role,
        hospital,
        doctorId,
        proofDocument,
      });

      return res.status(201).json({ doctor: newDoctor });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to create doctor: ${error.message}` });
    }
  } else if (req.method === "GET") {
    try {
      const doctors = await Doctor.find();
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
