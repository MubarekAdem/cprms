import mongoose from "mongoose";

const CitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.City || mongoose.model("City", CitySchema);
