import mongoose from "mongoose";
const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String, required: true },
    emergencyNumber: { type: String, required: true },
    bloodType: { type: String, required: true },
    otherDisease: { type: String },
    password: { type: String, required: true },
    diseaseName: { type: String, required: true },
    diseaseDescription: { type: String, required: true },
    medication: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now },
    hospitalName: { type: String, required: true },
    doctorName: { type: String, required: true },
    nationalId: { type: String, required: true },
    registeredBy: { type: String, required: true },
    registrarHospital: { type: String, required: true },
    birthDate: { type: String, required: true }, // Store the raw birth date
  },
  { timestamps: true }
);
