import { connectToDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await connectToDB();

  const { id } = req.query; // Get doctor ID from URL
  console.log(`Received ${req.method} request for doctor ID: ${id}`);

  if (req.method === "PUT") {
    try {
      const { firstName, lastName, email, phone, hospital, password } =
        req.body;
      console.log("PUT payload:", {
        firstName,
        lastName,
        email,
        phone,
        hospital,
        password,
      });

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !hospital) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Prepare update data for Doctor collection
      const updateData = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        hospital,
      };

      // Prepare update data for User collection
      let userUpdateData = { firstName, lastName, email, phone };

      // Hash password if provided
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
        const updatedUser = await User.findOneAndUpdate(
          { email },
          userUpdateData,
          { new: true }
        );
        if (!updatedUser) {
          console.warn(`User with email ${email} not found for update`);
        }
      } catch (userError) {
        console.error("User update failed:", userError);
        return res
          .status(500)
          .json({ error: `Failed to update user: ${userError.message}` });
      }

      res.status(200).json(updatedDoctor);
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ error: "Error updating doctor" });
    }
  } else if (req.method === "DELETE") {
    try {
      const doctor = await Doctor.findById(id);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      // Delete from Doctor collection
      await Doctor.findByIdAndDelete(id);

      // Delete from User collection
      const deletedUser = await User.findOneAndDelete({ email: doctor.email });
      if (!deletedUser) {
        console.warn(`User with email ${doctor.email} not found for deletion`);
      }

      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({ error: "Error deleting doctor" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
