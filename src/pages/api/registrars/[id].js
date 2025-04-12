import { connectToDB } from "@/lib/mongodb";
import Registrar from "@/models/Registrar";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  await connectToDB();

  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid registrar ID" });
  }

  try {
    if (req.method === "PUT") {
      // Update registrar details
      const updatedRegistrar = await Registrar.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedRegistrar) {
        return res.status(404).json({ error: "Registrar not found" });
      }
      return res.status(200).json({ registrar: updatedRegistrar });
    }

    if (req.method === "DELETE") {
      // Delete registrar
      const deletedRegistrar = await Registrar.findByIdAndDelete(id);
      if (!deletedRegistrar) {
        return res.status(404).json({ error: "Registrar not found" });
      }
      return res
        .status(200)
        .json({ message: "Registrar deleted successfully" });
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error handling registrar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
