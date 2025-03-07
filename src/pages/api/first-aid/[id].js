import { connectToDB } from "@/lib/mongodb";
import FirstAid from "@/models/FirstAid"; // Ensure you have this model

export default async function handler(req, res) {
  await connectToDB(); // Correct function call

  const { id } = req.query; // Extract First Aid Responder ID

  if (req.method === "GET") {
    try {
      const firstAid = await FirstAid.findById(id);
      if (!firstAid) {
        return res.status(404).json({ error: "First Aid Responder not found" });
      }
      res.status(200).json(firstAid);
    } catch (error) {
      res.status(500).json({ error: "Error fetching first aid responder" });
    }
  } else if (req.method === "PUT") {
    try {
      const { name, email, phone, hospital } = req.body;

      const updatedFirstAid = await FirstAid.findByIdAndUpdate(
        id,
        { name, email, phone, hospital },
        { new: true, runValidators: true }
      );

      if (!updatedFirstAid) {
        return res.status(404).json({ error: "First Aid Responder not found" });
      }

      res.status(200).json(updatedFirstAid);
    } catch (error) {
      res.status(500).json({ error: "Error updating first aid responder" });
    }
  } else if (req.method === "DELETE") {
    try {
      const deletedFirstAid = await FirstAid.findByIdAndDelete(id);
      if (!deletedFirstAid) {
        return res.status(404).json({ error: "First Aid Responder not found" });
      }
      res
        .status(200)
        .json({ message: "First Aid Responder deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting first aid responder" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
