import { connectToDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export default async function handler(req, res) {
  await connectToDB();

  const { id } = req.query; // Get doctor ID from URL

  if (req.method === "DELETE") {
    try {
      const deletedDoctor = await Doctor.findByIdAndDelete(id);
      if (!deletedDoctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
      return res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updatedDoctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      return res.status(200).json(updatedDoctor);
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
