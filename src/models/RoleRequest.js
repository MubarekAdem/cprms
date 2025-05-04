import mongoose from "mongoose";

const RoleRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedRole: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const RoleRequest =
  mongoose.models.RoleRequest ||
  mongoose.model("RoleRequest", RoleRequestSchema);

export default RoleRequest;
