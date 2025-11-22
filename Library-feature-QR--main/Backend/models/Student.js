/**
 * Student Model
 * -------------
 * Represents a student user (no authentication required).
 */

import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true, unique: true },
    rollNo: { type: String, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("Student", StudentSchema);
