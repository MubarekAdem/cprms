import { connectToDB } from "@/lib/mongodb";
import Registrar from "@/models/Registrar";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    const { name, email, phone, role, hospital, registrarId, proofDocument } =
      req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !role ||
      !hospital ||
      !registrarId ||
      !proofDocument
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newRegistrar = await Registrar.create({
        name,
        email,
        phone,
        role,
        hospital,
        registrarId,
        proofDocument,
      });

      return res.status(201).json({ registrar: newRegistrar });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to create registrar: ${error.message}` });
    }
  } else if (req.method === "GET") {
    try {
      const registrars = await Registrar.find();
      res.status(200).json(registrars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrars" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
