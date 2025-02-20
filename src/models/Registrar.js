import mongoose from "mongoose";

const registrarSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["doctor", "first-aid", "registrar"],
      required: true,
    },
    hospital: { type: String, required: true },
    registrarId: { type: String, required: true, unique: true },
    proofDocument: { type: String, required: true }, // URL to the document stored in Supabase
  },
  { timestamps: true }
);

export default mongoose.models.Registrar ||
  mongoose.model("Registrar", registrarSchema);
