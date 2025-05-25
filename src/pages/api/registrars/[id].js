import { connectToDB } from "@/lib/mongodb";
import Registrar from "@/models/Registrar";
import User from "@/models/User";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await connectToDB();

  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid registrar ID" });
  }

  if (req.method === "PUT") {
    try {
      const { firstName, lastName, email, phone, password, hospital } =
        req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !hospital) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Prepare update data for Registrar collection
      const updateData = {
        name: `${firstName} ${lastName}`,
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

      res.status(200).json(updatedRegistrar);
    } catch (error) {
      console.error("Error updating registrar:", error);
      res.status(500).json({ error: "Error updating registrar" });
    }
  } else if (req.method === "DELETE") {
    try {
      const registrar = await Registrar.findById(id);
      if (!registrar) {
        return res.status(404).json({ error: "Registrar not found" });
      }

      // Delete from Registrar collection
      await Registrar.findByIdAndDelete(id);

      // Delete from User collection
      const deletedUser = await User.findOneAndDelete({
        email: registrar.email,
      });
      if (!deletedUser) {
        console.warn(
          `User with email ${registrar.email} not found for deletion`
        );
      }

      res.status(200).json({ message: "Registrar deleted successfully" });
    } catch (error) {
      console.error("Error deleting registrar:", error);
      res.status(500).json({ error: "Error deleting registrar" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
