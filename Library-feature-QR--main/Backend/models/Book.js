/**
 * Book Model
 * ----------
 * Represents a book in the library.
 */

import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    isbn: { type: String },
    description: { type: String },
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    qrData: { type: String },
    coverImage: { type: String, default: "" }, // NEW: For book cover images
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("Book", BookSchema);
