import { connectToDB } from "@/lib/mongodb";
import Hospital from "@/models/Hospital";

export default async function handler(req, res) {
  await connectToDB(); // Ensure DB is connected

  const { id } = req.query; // Extract hospital ID from the request

  if (req.method === "GET") {
    try {
      const hospital = await Hospital.findOne({ id: id }); // Use custom ID
      if (!hospital)
        return res.status(404).json({ error: "Hospital not found" });

      res.status(200).json(hospital);
    } catch (error) {
      res.status(500).json({ error: "Error fetching hospital" });
    }
  } else if (req.method === "PUT") {
    try {
      const { name, location } = req.body;

      const updatedHospital = await Hospital.findOneAndUpdate(
        { id: id }, // Find by custom `id`
        { name, location },
        { new: true, runValidators: true }
      );

      if (!updatedHospital)
        return res.status(404).json({ error: "Hospital not found" });

      res.status(200).json(updatedHospital);
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ error: "Error updating hospital" });
    }
  } else if (req.method === "DELETE") {
    try {
      const deletedHospital = await Hospital.findOneAndDelete({ id: id }); // Use `id`
      if (!deletedHospital)
        return res.status(404).json({ error: "Hospital not found" });

      res.status(200).json({ message: "Hospital deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting hospital" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
