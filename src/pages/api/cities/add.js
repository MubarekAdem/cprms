import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, code, address } = req.body;

      if (!name || !code || !address) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const db = await connectToDatabase();
      const citiesCollection = db.collection("cities");

      // Insert the new city into the cities collection
      const result = await citiesCollection.insertOne({ name, code, address });

      return res
        .status(200)
        .json({ message: "City added successfully", city: result.ops[0] });
    } catch (error) {
      console.error("Error adding city:", error);
      return res.status(500).json({ error: "Error adding city" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
