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
  } else if (req.method === "PUT") {
    const { id } = req.query;
    try {
      const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(updatedDoctor);
    } catch (error) {
      res.status(500).json({ error: "Failed to update doctor" });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      await Doctor.findByIdAndDelete(id);
      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete doctor" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
