import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  proofDocument: {
    type: String, // You can store the URL for the proof document here if necessary
  },
});

const Hospital =
  mongoose.models.Hospital || mongoose.model("Hospital", hospitalSchema);

export default Hospital;
