// [file name]: bookRoutes.js - UPDATED
import express from "express";
import Book from "../models/Book.js";
import { addBook, getBookById } from "../controllers/bookController.js"; // Import the function

const router = express.Router();

// ✅ Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get book by ID - ADD THIS ROUTE
router.get("/:id", getBookById);

// ✅ Add new book (with validation and QR code generation)
router.post("/", addBook);

export default router;
