import { connectToDB } from "@/lib/mongodb";
import City from "@/models/City";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    try {
      const cities = await City.find();
      res.status(200).json(cities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cities" });
    }
  } else if (req.method === "POST") {
    const { name, code, address } = req.body;

    if (!name || !code || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const newCity = new City({ name, code, address });
      await newCity.save();
      res.status(201).json({ message: "City created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create city" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
