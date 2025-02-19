import { connectToDB } from "@/lib/mongodb"; // Your DB connection function
import Hospital from "@/models/Hospital"; // Assuming you have the model for hospitals

export default async function handler(req, res) {
  await connectToDB();
  if (req.method === "POST") {
    const { name, id, location, proofDocument } = req.body;

    if (!name || !id || !location || !proofDocument) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newHospital = await Hospital.create({
        name,
        id,
        location,
        proofDocument,
      });
      return res.status(201).json({ hospital: newHospital });
    } catch (err) {
      return res
        .status(500)
        .json({ error: `Failed to create hospital: ${err.message}` });
    }
  } else if (req.method === "GET") {
    try {
      const hospitals = await Hospital.find();
      res.status(200).json(hospitals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  } else if (req.method === "POST") {
    const { name, id, location, proofDocument } = req.body;

    if (!name || !id || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const newHospital = new Hospital({ name, id, location, proofDocument });
      await newHospital.save();
      res.status(201).json({ message: "Hospital created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create hospital" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
