import { connectToDB } from "@/lib/mongodb";
import FirstAid from "@/models/FirstAid";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    const { name, email, phone, role, hospital, firstAidId, proofDocument } =
      req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !role ||
      !hospital ||
      !firstAidId ||
      !proofDocument
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newFirstAid = await FirstAid.create({
        name,
        email,
        phone,
        role,
        hospital,
        firstAidId,
        proofDocument,
      });

      return res.status(201).json({ firstAid: newFirstAid });
    } catch (error) {
      return res
        .status(500)
        .json({
          error: `Failed to create First Aid responder: ${error.message}`,
        });
    }
  } else if (req.method === "GET") {
    try {
      const firstAids = await FirstAid.find();
      res.status(200).json(firstAids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch First Aid responders" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
