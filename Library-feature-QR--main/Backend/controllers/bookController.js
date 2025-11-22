// [file name]: bookController.js - UPDATED
import Book from "../models/Book.js";
import { generateQRCode } from "../utils/qrGenerator.js";

export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, description, totalCopies } = req.body;

    // ✅ Enhanced input validation
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Valid title is required",
      });
    }

    if (!Number.isInteger(+totalCopies) || +totalCopies < 1) {
      return res.status(400).json({
        message: "Total copies must be a positive integer",
      });
    }

    // Check for duplicate ISBN
    if (isbn?.trim()) {
      const existingBook = await Book.findOne({ isbn: isbn.trim() });
      if (existingBook) {
        return res.status(400).json({
          message: "Book with this ISBN already exists",
        });
      }
    }

    // ✅ Create new book with QR code in single transaction
    const bookData = {
      title: title.trim(),
      author: author?.trim() || "",
      isbn: isbn?.trim() || "",
      description: description?.trim() || "",
      totalCopies: +totalCopies,
      availableCopies: +totalCopies,
    };

    // Generate QR code first
    let qrDataUrl;
    try {
      const newBookTemp = new Book(bookData);
      qrDataUrl = await generateQRCode(newBookTemp._id.toString());
      bookData.qrData = qrDataUrl;
    } catch (qrError) {
      console.error("QR generation failed:", qrError);
      return res.status(500).json({
        message: "QR code generation failed",
        error: qrError.message || String(qrError),
      });
    }

    // Save book with QR data
    const book = new Book(bookData);
    await book.save();

    // ✅ Success response
    res.status(201).json({
      message: "Book created successfully with QR code",
      book,
    });
  } catch (error) {
    console.error("Error adding book:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Book with this ISBN already exists",
      });
    }

    res.status(500).json({
      message: "Server error while adding book",
      error: error.message || String(error),
    });
  }
};

// Add getBookById controller
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({
      message: "Server error while fetching book",
      error: error.message || String(error),
    });
  }
};
