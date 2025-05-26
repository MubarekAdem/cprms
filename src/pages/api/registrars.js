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
      // Check for duplicates in Registrar collection
      const existingEmail = await Registrar.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          error: "Email already registered",
          field: "email",
          message: `Email ${email} is already registered`,
        });
      }

      const existingPhone = await Registrar.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          error: "Phone number already registered",
          field: "phone",
          message: `Phone number ${phone} is already registered`,
        });
      }

      const existingRegistrarId = await Registrar.findOne({ registrarId });
      if (existingRegistrarId) {
        return res.status(400).json({
          error: "Registrar ID already in use",
          field: "registrarId",
          message: `Registrar ID ${registrarId} is already in use`,
        });
      }

      // Check for existing user in User collection
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: "User already registered",
          field: "email",
          message: `User with email ${email} is already registered`,
        });
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
        return res.status(500).json({
          error: "Failed to create user",
          message: userError.message,
        });
      }

      return res.status(201).json({ registrar: newRegistrar });
    } catch (error) {
      if (error.code === 11000) {
        // Handle MongoDB duplicate key error
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        return res.status(400).json({
          error: `${field} already in use`,
          field,
          message: `${field} ${value} is already in use`,
        });
      }
      console.error("Registrar creation error:", error);
      return res.status(500).json({
        error: "Failed to create registrar",
        message: error.message,
      });
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
    const { id } = req.params || req.query; // Support both params and query
    const { firstName, lastName, email, phone, password, hospital } = req.body;

    if (!id || !firstName || !lastName || !email || !phone || !hospital) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check for duplicate email in Registrar collection (excluding current registrar)
      const existingEmail = await Registrar.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingEmail) {
        return res.status(400).json({
          error: "Email already registered",
          field: "email",
          message: `Email ${email} is already registered`,
        });
      }

      // Check for duplicate phone in Registrar collection (excluding current registrar)
      const existingPhone = await Registrar.findOne({
        phone,
        _id: { $ne: id },
      });
      if (existingPhone) {
        return res.status(400).json({
          error: "Phone number already registered",
          field: "phone",
          message: `Phone number ${phone} is already registered`,
        });
      }

      // Check for duplicate email in User collection (excluding current user)
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          error: "User already registered",
          field: "email",
          message: `User with email ${email} is already registered`,
        });
      }

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
        {
          new: true,
        }
      );

      if (!updatedRegistrar) {
        return res.status(404).json({ error: "Registrar not found" });
      }

      // Update User collection
      try {
        await User.findOneAndUpdate(
          { email: updatedRegistrar.email },
          userUpdateData
        );
      } catch (userError) {
        console.error("User update failed:", userError);
        return res.status(500).json({
          error: "Failed to update user",
          message: userError.message,
        });
      }

      res.status(200).json(updatedRegistrar);
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        return res.status(400).json({
          error: `${field} already in use`,
          field,
          message: `${field} ${value} is already in use`,
        });
      }
      console.error("Registrar update error:", error);
      res.status(500).json({
        error: "Failed to update registrar",
        message: error.message,
      });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.params || req.query;
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
      res.status(500).json({
        error: "Failed to delete registrar",
        message: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
