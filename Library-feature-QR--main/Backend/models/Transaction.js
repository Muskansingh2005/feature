/**
 * Transaction Model
 * -----------------
 * Stores book issue/return history with due dates.
 */

import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  type: {
    type: String,
    enum: ["issue", "return"],
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    default: function () {
      // 14 days from issue date
      const due = new Date();
      due.setDate(due.getDate() + 14);
      return due;
    },
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "returned", "overdue"],
    default: "active",
  },
});

// Index for active transactions
TransactionSchema.index({ studentId: 1, bookId: 1, status: 1 });

export default mongoose.model("Transaction", TransactionSchema);
