import { connectToDB } from "@/lib/mongodb";
import Registrar from "@/models/Registrar";
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
      registrarId,
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
      !registrarId ||
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

      // Create registrar in Registrar collection
      const newRegistrar = await Registrar.create({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        role,
        hospital,
        registrarId,
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
        // Roll back Registrar creation if User creation fails
        await Registrar.findByIdAndDelete(newRegistrar._id);
        console.error("User creation failed:", userError);
        return res
          .status(500)
          .json({ error: `Failed to create user: ${userError.message}` });
      }

      return res.status(201).json({ registrar: newRegistrar });
    } catch (error) {
      console.error("Registrar creation error:", error);
      return res
        .status(500)
        .json({ error: `Failed to create registrar: ${error.message}` });
    }
  } else if (req.method === "GET") {
    try {
      const registrars = await Registrar.find();
      res.status(200).json(registrars);
    } catch (error) {
      console.error("Fetch registrars error:", error);
      res.status(500).json({ error: "Failed to fetch registrars" });
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

      // Update Registrar collection
      const updatedRegistrar = await Registrar.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedRegistrar) {
        return res.status(404).json({ error: "Registrar not found" });
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

      res.status(200).json(updatedRegistrar);
    } catch (error) {
      console.error("Registrar update error:", error);
      res
        .status(500)
        .json({ error: `Failed to update registrar: ${error.message}` });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const registrar = await Registrar.findById(id);
      if (!registrar) {
        return res.status(404).json({ error: "Registrar not found" });
      }

      // Delete from Registrar collection
      await Registrar.findByIdAndDelete(id);
      // Delete from User collection
      await User.findOneAndDelete({ email: registrar.email });

      res.status(200).json({ message: "Registrar deleted successfully" });
    } catch (error) {
      console.error("Registrar deletion error:", error);
      res
        .status(500)
        .json({ error: `Failed to delete registrar: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
