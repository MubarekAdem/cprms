import { supabase } from "@/lib/supabase"; // Import the Supabase client

// API Route for hospitals
export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    // Handle POST request to add a new hospital
    const { name, id, location, proofDocument } = req.body;

    if (!name || !id || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Insert hospital data into Supabase
      const { data, error } = await supabase
        .from("hospitals")
        .insert([{ name, id, location, proof_document: proofDocument }])
        .single(); // Ensure only one row is inserted

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ hospital: data });
    } catch (err) {
      return res.status(500).json({ error: "Failed to create hospital" });
    }
  } else if (method === "GET") {
    // Handle GET request to fetch all hospitals
    try {
      const { data, error } = await supabase.from("hospitals").select("*");

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
