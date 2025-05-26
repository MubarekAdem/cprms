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
      // Check for duplicates in Doctor collection
      const existingDoctorEmail = await Doctor.findOne({ email });
      if (existingDoctorEmail) {
        return res.status(400).json({
          error: "Email already registered",
          field: "email",
          message: `Email ${email} is already registered`,
        });
      }

      const existingDoctorPhone = await Doctor.findOne({ phone });
      if (existingDoctorPhone) {
        return res.status(400).json({
          error: "Phone number already registered",
          field: "phone",
          message: `Phone number ${phone} is already registered`,
        });
      }

      const existingDoctorId = await Doctor.findOne({ doctorId });
      if (existingDoctorId) {
        return res.status(400).json({
          error: "Doctor ID already in use",
          field: "doctorId",
          message: `Doctor ID ${doctorId} is already in use`,
        });
      }

      // Check if user already exists in User collection
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
        return res.status(500).json({
          error: "Failed to create user",
          message: userError.message,
        });
      }

      return res.status(201).json({ doctor: newDoctor });
    } catch (error) {
      console.error("Doctor creation error:", error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        return res.status(400).json({
          error: `${field} already in use`,
          field,
          message: `${field} ${value} is already in use`,
        });
      }
      return res.status(500).json({
        error: "Failed to create doctor",
        message: error.message,
      });
    }
  } else if (req.method === "GET") {
    try {
      const doctors = await Doctor.find();
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Fetch doctors error:", error);
      res.status(500).json({
        error: "Failed to fetch doctors",
        message: error.message,
      });
    }
  } else if (req.method === "PUT") {
    const { id } = req.query;
    const { firstName, lastName, email, phone, password, hospital } = req.body;

    if (!id || !firstName || !lastName || !email || !phone || !hospital) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    try {
      // Check for duplicate email in Doctor collection (excluding current doctor)
      const existingDoctorEmail = await Doctor.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingDoctorEmail) {
        return res.status(400).json({
          error: "Email already registered",
          field: "email",
          message: `Email ${email} is already registered`,
        });
      }

      // Check for duplicate phone in Doctor collection (excluding current doctor)
      const existingDoctorPhone = await Doctor.findOne({
        phone,
        _id: { $ne: id },
      });
      if (existingDoctorPhone) {
        return res.status(400).json({
          error: "Phone number already registered",
          field: "phone",
          message: `Phone number ${phone} is already registered`,
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

      // Update Doctor collection
      const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedDoctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      // Update User collection
      try {
        const user = await User.findOneAndUpdate(
          { email: updatedDoctor.email },
          userUpdateData,
          { new: true }
        );
        if (!user) {
          console.warn(`User with email ${updatedDoctor.email} not found`);
        }
      } catch (userError) {
        console.error("User update failed:", userError);
        return res.status(500).json({
          error: "Failed to update user",
          message: userError.message,
        });
      }

      res.status(200).json(updatedDoctor);
    } catch (error) {
      console.error("Doctor update error:", error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        return res.status(400).json({
          error: `${field} already in use`,
          field,
          message: `${field} ${value} is already in use`,
        });
      }
      res.status(500).json({
        error: "Failed to update doctor",
        message: error.message,
      });
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
      try {
        await User.findOneAndDelete({ email: doctor.email });
      } catch (userError) {
        console.warn(`User with email ${doctor.email} not found for deletion`);
      }

      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error("Doctor deletion error:", error);
      res.status(500).json({
        error: "Failed to delete doctor",
        message: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
