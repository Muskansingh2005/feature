// [file name]: Transaction.js - UPDATED
/**
 * Transaction Model with Fine System
 * -----------------
 * Stores book issue/return history with due dates and fines.
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
    required: true, // Make it required
  },
  dueDate: {
    type: Date,
    required: true, // Make it required
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "returned", "overdue"],
    default: "active",
  },
  fineAmount: {
    type: Number,
    default: 0,
  },
  finePaid: {
    type: Boolean,
    default: false,
  },
  daysOverdue: {
    type: Number,
    default: 0,
  },
});

// Index for active transactions
TransactionSchema.index({ studentId: 1, bookId: 1, status: 1 });

// Calculate fine before saving
TransactionSchema.pre("save", function (next) {
  if (this.type === "return" && this.status === "returned") {
    // Calculate fine if book is returned after due date
    const dueDate = new Date(this.dueDate);
    const returnDate = new Date(this.returnDate || new Date());

    if (returnDate > dueDate) {
      const timeDiff = returnDate.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
      this.daysOverdue = daysOverdue;
      this.fineAmount = daysOverdue * 5; // ₹5 per day
    }
  }

  // Update status to overdue if due date passed
  if (this.status === "active" && this.dueDate < new Date()) {
    this.status = "overdue";
  }

  next();
});

export default mongoose.model("Transaction", TransactionSchema);
