import { connectToDB } from "@/lib/mongodb";
import FirstAid from "@/models/FirstAid";
import User from "@/models/User";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await connectToDB();

  const { id } = req.query; // Get first aid responder ID from URL

  if (req.method === "PUT") {
    try {
      const { firstName, lastName, email, phone, password, hospital } =
        req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !hospital) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Prepare update data for FirstAid collection
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

      // Update FirstAid collection
      const updatedFirstAid = await FirstAid.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedFirstAid) {
        return res.status(404).json({ error: "First aid responder not found" });
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

      res.status(200).json(updatedFirstAid);
    } catch (error) {
      console.error("Error updating first aid responder:", error);
      res.status(500).json({ error: "Error updating first aid responder" });
    }
  } else if (req.method === "DELETE") {
    try {
      const firstAid = await FirstAid.findById(id);
      if (!firstAid) {
        return res.status(404).json({ error: "First aid responder not found" });
      }

      // Delete from FirstAid collection
      await FirstAid.findByIdAndDelete(id);

      // Delete from User collection
      const deletedUser = await User.findOneAndDelete({
        email: firstAid.email,
      });
      if (!deletedUser) {
        console.warn(
          `User with email ${firstAid.email} not found for deletion`
        );
      }

      res
        .status(200)
        .json({ message: "First aid responder deleted successfully" });
    } catch (error) {
      console.error("Error deleting first aid responder:", error);
      res.status(500).json({ error: "Error deleting first aid responder" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
