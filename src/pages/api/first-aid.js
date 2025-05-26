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
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          firstName: !firstName ? "First name is required" : null,
          lastName: !lastName ? "Last name is required" : null,
          email: !email ? "Email is required" : null,
          phone: !phone ? "Phone is required" : null,
          password: !password ? "Password is required" : null,
          role: !role ? "Role is required" : null,
          hospital: !hospital ? "Hospital is required" : null,
          firstAidId: !firstAidId ? "First Aid ID is required" : null,
          proofDocument: !proofDocument ? "Proof document is required" : null,
        },
      });
    }

    try {
      // Check for duplicates in FirstAid collection
      const existingFirstAidEmail = await FirstAid.findOne({ email });
      if (existingFirstAidEmail) {
        return res.status(400).json({
          error: "Email already registered",
          field: "email",
          message: `Email ${email} is already registered`,
        });
      }

      const existingFirstAidPhone = await FirstAid.findOne({ phone });
      if (existingFirstAidPhone) {
        return res.status(400).json({
          error: "Phone number already registered",
          field: "phone",
          message: `Phone number ${phone} is already registered`,
        });
      }

      const existingFirstAidId = await FirstAid.findOne({ firstAidId });
      if (existingFirstAidId) {
        return res.status(400).json({
          error: "First Aid ID already in use",
          field: "firstAidId",
          message: `First Aid ID ${firstAidId} is already in use`,
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
        return res.status(500).json({
          error: "Failed to create user",
          message: userError.message,
        });
      }

      return res.status(201).json({ firstAid: newFirstAid });
    } catch (error) {
      console.error("FirstAid creation error:", error);
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
        error: "Failed to create first aid responder",
        message: error.message,
      });
    }
  } else if (req.method === "GET") {
    try {
      const firstAids = await FirstAid.find();
      res.status(200).json(firstAids);
    } catch (error) {
      console.error("Fetch first aid responders error:", error);
      res.status(500).json({
        error: "Failed to fetch first aid responders",
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
      // Check for duplicate email in FirstAid collection (excluding current responder)
      const existingFirstAidEmail = await FirstAid.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingFirstAidEmail) {
        return res.status(400).json({
          error: "Email already registered",
          field: "email",
          message: `Email ${email} is already registered`,
        });
      }

      // Check for duplicate phone in FirstAid collection (excluding current responder)
      const existingFirstAidPhone = await FirstAid.findOne({
        phone,
        _id: { $ne: id },
      });
      if (existingFirstAidPhone) {
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

      // Update FirstAid collection
      const updatedFirstAid = await FirstAid.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedFirstAid) {
        return res.status(404).json({ error: "First aid responder not found" });
      }

      // Update User collection
      try {
        const user = await User.findOneAndUpdate(
          { email: updatedFirstAid.email },
          userUpdateData,
          { new: true }
        );
        if (!user) {
          console.warn(`User with email ${updatedFirstAid.email} not found`);
        }
      } catch (userError) {
        console.error("User update failed:", userError);
        return res.status(500).json({
          error: "Failed to update user",
          message: userError.message,
        });
      }

      res.status(200).json(updatedFirstAid);
    } catch (error) {
      console.error("FirstAid update error:", error);
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
        error: "Failed to update first aid responder",
        message: error.message,
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
      try {
        await User.findOneAndDelete({ email: firstAid.email });
      } catch (userError) {
        console.warn(
          `User with email ${firstAid.email} not found for deletion`
        );
      }

      res.status(200).json({
        message: "First aid responder deleted successfully",
      });
    } catch (error) {
      console.error("FirstAid deletion error:", error);
      res.status(500).json({
        error: "Failed to delete first aid responder",
        message: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
