// [file name]: transactionRoutes.js - UPDATED (WITH FINE ROUTES)
import express from "express";
import {
  issueBook,
  returnBook,
  getTransactions,
  getActiveIssues,
  getStudentTransactions,
  getBookAvailability,
  getOverdueBooks,
  payFine,
} from "../controllers/transactionController.js";

const router = express.Router();

// POST /api/transactions/issue → Issue a book
router.post("/issue", issueBook);

// POST /api/transactions/return → Return a book
router.post("/return", returnBook);

// GET /api/transactions → List transactions
router.get("/", getTransactions);

// GET /api/transactions/active/:studentId → Get active issues for student
router.get("/active/:studentId", getActiveIssues);

// GET /api/transactions/student/:studentId → Get student's transaction history
router.get("/student/:studentId", getStudentTransactions);

// GET /api/transactions/book/:bookId/availability → Get book availability
router.get("/book/:bookId/availability", getBookAvailability);

// GET /api/transactions/overdue → Get overdue books with fines
router.get("/overdue", getOverdueBooks);

// POST /api/transactions/pay-fine → Pay fine for a transaction
router.post("/pay-fine", payFine);

export default router;
