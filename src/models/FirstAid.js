import { Schema, model, models } from "mongoose";

const firstAidSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    hospital: { type: String, required: true },
    firstAidId: { type: String, required: true },
    proofDocument: { type: String, required: true },
  },
  { timestamps: true }
);

const FirstAid = models.FirstAid || model("FirstAid", firstAidSchema);

export default FirstAid;
