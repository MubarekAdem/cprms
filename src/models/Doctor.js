import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
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
    doctorId: { type: String, required: true, unique: true },
    proofDocument: { type: String, required: true }, // URL of proof document from Supabase
  },
  { timestamps: true }
);

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
export default Doctor;
