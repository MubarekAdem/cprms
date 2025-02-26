import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    nationalId: { type: String, required: true },
    diseaseName: { type: String, required: true },
    diseaseDescription: { type: String, required: true },
    medication: { type: String, required: true },
    hospitalName: { type: String, required: true },
    doctorName: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.MedicalRecord ||
  mongoose.model("MedicalRecord", MedicalRecordSchema);
