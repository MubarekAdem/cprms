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
  } else {
    req.method === "PUT";
    try {
      const { name, email, phone, hospital } = req.body;

      const updatedDoctor = await Doctor.findByIdAndUpdate(
        id,
        { name, email, phone, hospital },
        { new: true }
      );

      if (!updatedDoctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      res.json(updatedDoctor);
    } catch (error) {
      res.status(500).json({ error: "Error updating doctor" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
