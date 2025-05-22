import { connectToDB } from "@/lib/mongodb";
import FirstAid from "@/models/FirstAid";
import User from "@/models/User";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "POST") {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      hospital,
      firstAidId,
      proofDocument,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !role ||
      !hospital ||
      !firstAidId ||
      !proofDocument
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check if user already exists in User collection
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already registered" });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create first aid responder in FirstAid collection
      const newFirstAid = await FirstAid.create({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        role,
        hospital,
        firstAidId,
        proofDocument,
      });

      // Create corresponding user in User collection
      try {
        await User.create({
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          role,
        });
      } catch (userError) {
        // Roll back FirstAid creation if User creation fails
        await FirstAid.findByIdAndDelete(newFirstAid._id);
        console.error("User creation failed:", userError);
        return res
          .status(500)
          .json({ error: `Failed to create user: ${userError.message}` });
      }

      return res.status(201).json({ firstAid: newFirstAid });
    } catch (error) {
      console.error("FirstAid creation error:", error);
      return res
        .status(500)
        .json({
          error: `Failed to create first aid responder: ${error.message}`,
        });
    }
  } else if (req.method === "GET") {
    try {
      const firstAids = await FirstAid.find();
      res.status(200).json(firstAids);
    } catch (error) {
      console.error("Fetch first aid responders error:", error);
      res.status(500).json({ error: "Failed to fetch first aid responders" });
    }
  } else if (req.method === "PUT") {
    const { id } = req.query;
    const { firstName, lastName, email, phone, password, hospital } = req.body;

    if (!firstName || !lastName || !email || !phone || !hospital) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const updateData = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        hospital,
      };
      let userUpdateData = { firstName, lastName, email, phone };

      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        userUpdateData.password = hashedPassword;
      }

      // Update FirstAid collection
      const updatedFirstAid = await FirstAid.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedFirstAid) {
        return res.status(404).json({ error: "First aid responder not found" });
      }

      // Update User collection
      try {
        await User.findOneAndUpdate({ email }, userUpdateData);
      } catch (userError) {
        console.error("User update failed:", userError);
        return res
          .status(500)
          .json({ error: `Failed to update user: ${userError.message}` });
      }

      res.status(200).json(updatedFirstAid);
    } catch (error) {
      console.error("FirstAid update error:", error);
      res
        .status(500)
        .json({
          error: `Failed to update first aid responder: ${error.message}`,
        });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const firstAid = await FirstAid.findById(id);
      if (!firstAid) {
        return res.status(404).json({ error: "First aid responder not found" });
      }

      // Delete from FirstAid collection
      await FirstAid.findByIdAndDelete(id);
      // Delete from User collection
      await User.findOneAndDelete({ email: firstAid.email });

      res
        .status(200)
        .json({ message: "First aid responder deleted successfully" });
    } catch (error) {
      console.error("FirstAid deletion error:", error);
      res
        .status(500)
        .json({
          error: `Failed to delete first aid responder: ${error.message}`,
        });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
