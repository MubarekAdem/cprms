import { connectToDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
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
      doctorId,
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
      !doctorId ||
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

      // Create doctor in Doctor collection
      const newDoctor = await Doctor.create({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        role,
        hospital,
        doctorId,
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
        // Roll back Doctor creation if User creation fails
        await Doctor.findByIdAndDelete(newDoctor._id);
        console.error("User creation failed:", userError);
        return res
          .status(500)
          .json({ error: `Failed to create user: ${userError.message}` });
      }

      return res.status(201).json({ doctor: newDoctor });
    } catch (error) {
      console.error("Doctor creation error:", error);
      return res
        .status(500)
        .json({ error: `Failed to create doctor: ${error.message}` });
    }
  } else if (req.method === "GET") {
    try {
      const doctors = await Doctor.find();
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Fetch doctors error:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
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
        updateData.password = hashedPassword;
        userUpdateData.password = hashedPassword;
      }

      // Update Doctor collection
      const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedDoctor) {
        return res.status(404).json({ error: "Doctor not found" });
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

      res.status(200).json(updatedDoctor);
    } catch (error) {
      console.error("Doctor update error:", error);
      res
        .status(500)
        .json({ error: `Failed to update doctor: ${error.message}` });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const doctor = await Doctor.findById(id);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      // Delete from Doctor collection
      await Doctor.findByIdAndDelete(id);
      // Delete from User collection
      await User.findOneAndDelete({ email: doctor.email });

      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error("Doctor deletion error:", error);
      res
        .status(500)
        .json({ error: `Failed to delete doctor: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
