/**
 * Transaction Routes
 * ------------------
 * Handles issue and return operations for books.
 */
import express from "express";
import {
  issueBook,
  returnBook,
  getTransactions,
  getActiveStudentIssues, // NEW
} from "../controllers/transactionController.js";

const router = express.Router();

// POST /api/transactions/issue → Issue a book
router.post("/issue", issueBook);

// POST /api/transactions/return → Return a book
router.post("/return", returnBook);

// GET /api/transactions → List all transactions
router.get("/", getTransactions);

// NEW: GET /api/transactions/student/:studentId/active → Get active issues for student
router.get("/student/:studentId/active", getActiveStudentIssues);

export default router;
