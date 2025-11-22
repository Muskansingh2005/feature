// [file name]: transactionController.js - UPDATED (FIXED QUANTITY ISSUE)
/**
 * Transaction Controller (No Authentication)
 * ------------------------------------------
 * Handles book issue and return operations without authentication.
 * FIXED: Multiple copies issue/return logic
 */

import Transaction from "../models/Transaction.js";
import Book from "../models/Book.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";

/**
 * @desc Issue a book to a student
 * @route POST /api/transactions/issue
 * @access Public
 */
const issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId } = req.body;

    // Enhanced validation
    if (!studentId || !bookId) {
      return res.status(400).json({
        message: "studentId and bookId are required",
      });
    }

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        message: "Invalid studentId or bookId format",
      });
    }

    const [student, book] = await Promise.all([
      Student.findById(studentId),
      Book.findById(bookId),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // FIXED: Check if this specific student already has this book issued and not returned
    const studentActiveIssue = await Transaction.findOne({
      studentId,
      bookId,
      status: "active",
    });

    if (studentActiveIssue) {
      return res.status(400).json({
        message: "This book is already issued to this student",
      });
    }

    // FIXED: Check if any copies are available (not if ALL copies are issued)
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        message: "No copies available to issue",
      });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create transaction and update book in parallel
    const [transaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "issue",
        dueDate,
        status: "active",
      }).save(),
      Book.findByIdAndUpdate(
        bookId,
        {
          $inc: { availableCopies: -1 },
        },
        { new: true }
      ),
    ]);

    // Populate the response with student and book details
    await transaction.populate("studentId", "name rollNo email");
    await transaction.populate("bookId", "title author isbn");

    res.status(201).json({
      message: "Book issued successfully",
      transaction,
      dueDate: dueDate.toISOString().split("T")[0],
      availableCopies: book.availableCopies - 1, // Return updated count
    });
  } catch (error) {
    console.error("Issue book error:", error);
    next(error);
  }
};

/**
 * @desc Return a book
 * @route POST /api/transactions/return
 * @access Public
 */
const returnBook = async (req, res, next) => {
  try {
    const { studentId, bookId } = req.body;

    if (!studentId || !bookId) {
      return res.status(400).json({
        message: "studentId and bookId are required",
      });
    }

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        message: "Invalid studentId or bookId format",
      });
    }

    const [student, book] = await Promise.all([
      Student.findById(studentId),
      Book.findById(bookId),
    ]);

    if (!student || !book) {
      return res.status(404).json({
        message: "Student or Book not found",
      });
    }

    // FIXED: Check if this specific student has this book issued and not returned
    const activeIssue = await Transaction.findOne({
      studentId,
      bookId,
      status: "active",
    });

    if (!activeIssue) {
      return res.status(400).json({
        message: "No active issue found for this student and book",
      });
    }

    // Create return transaction and update book
    const [returnTransaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "return",
        returnDate: new Date(),
        status: "returned",
      }).save(),
      Book.findByIdAndUpdate(
        bookId,
        {
          $inc: { availableCopies: 1 },
        },
        { new: true }
      ),
      // Update the original issue transaction status
      Transaction.findByIdAndUpdate(activeIssue._id, {
        status: "returned",
        returnDate: new Date(),
      }),
    ]);

    await returnTransaction.populate("studentId", "name rollNo email");
    await returnTransaction.populate("bookId", "title author isbn");

    res.status(201).json({
      message: "Book returned successfully",
      transaction: returnTransaction,
      availableCopies: book.availableCopies + 1, // Return updated count
    });
  } catch (error) {
    console.error("Return book error:", error);
    next(error);
  }
};

/**
 * @desc Get all transactions
 * @route GET /api/transactions
 * @access Public
 */
const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, studentId, bookId, type, status } = req.query;

    const filter = {};

    // Filter by query parameters
    if (studentId) filter.studentId = studentId;
    if (bookId) filter.bookId = bookId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate("studentId", "name rollNo email")
      .populate("bookId", "title author isbn coverImage")
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    next(error);
  }
};

/**
 * @desc Get active issues for a student
 * @route GET /api/transactions/active/:studentId
 * @access Public
 */
const getActiveIssues = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const activeIssues = await Transaction.find({
      studentId,
      status: "active",
      type: "issue",
    })
      .populate("bookId", "title author isbn coverImage")
      .sort({ issueDate: -1 });

    res.json({
      activeIssues,
      count: activeIssues.length,
    });
  } catch (error) {
    console.error("Get active issues error:", error);
    next(error);
  }
};

/**
 * @desc Get student's transaction history
 * @route GET /api/transactions/student/:studentId
 * @access Public
 */
const getStudentTransactions = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const transactions = await Transaction.find({ studentId })
      .populate("bookId", "title author isbn coverImage")
      .sort({ issueDate: -1 });

    res.json({
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Get student transactions error:", error);
    next(error);
  }
};

/**
 * @desc Get book availability and issue status
 * @route GET /api/transactions/book/:bookId/availability
 * @access Public
 */
const getBookAvailability = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Get all active issues for this book
    const activeIssues = await Transaction.find({
      bookId,
      status: "active",
    }).populate("studentId", "name rollNo email");

    res.json({
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        issuedCopies: book.totalCopies - book.availableCopies,
      },
      activeIssues,
      issuedTo: activeIssues.map((issue) => ({
        studentId: issue.studentId._id,
        studentName: issue.studentId.name,
        rollNo: issue.studentId.rollNo,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
      })),
    });
  } catch (error) {
    console.error("Get book availability error:", error);
    next(error);
  }
};

// Export all functions
export {
  issueBook,
  returnBook,
  getTransactions,
  getActiveIssues,
  getStudentTransactions,
  getBookAvailability,
};
