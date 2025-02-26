// models/Patient.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationalId: { type: String, required: true },
  birthDate: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true },
  emergencyNumber: { type: String, required: true },
  bloodType: { type: String, required: true },
  otherDisease: { type: String, required: true },
  password: { type: String, required: true },
  registeredBy: { type: String, required: true },
  registrarHospital: { type: String, required: true },
});

const Patient =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export default Patient;
