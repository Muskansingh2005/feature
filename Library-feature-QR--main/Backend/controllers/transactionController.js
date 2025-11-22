// [file name]: transactionController.js - UPDATED (FIXED DATE HANDLING)
/**
 * Transaction Controller with Fine System
 * ------------------------------------------
 * Handles book issue and return operations with fines for overdue books.
 * FIXED: Date handling for issue and due dates
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

    // Check if this specific student already has this book issued and not returned
    const studentActiveIssue = await Transaction.findOne({
      studentId,
      bookId,
      status: { $in: ["active", "overdue"] },
    });

    if (studentActiveIssue) {
      return res.status(400).json({
        message: "This book is already issued to this student",
      });
    }

    // Check if any copies are available
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        message: "No copies available to issue",
      });
    }

    // FIXED: Set proper dates
    const issueDate = new Date(); // Today's date
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 14); // 14 days from today

    // Create transaction and update book in parallel
    const [transaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "issue",
        issueDate: issueDate, // Set today's date
        dueDate: dueDate, // Set due date 14 days from today
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
      issueDate: issueDate.toISOString().split("T")[0], // Return formatted date
      dueDate: dueDate.toISOString().split("T")[0], // Return formatted date
      availableCopies: book.availableCopies - 1,
    });
  } catch (error) {
    console.error("Issue book error:", error);
    next(error);
  }
};

/**
 * @desc Return a book with fine calculation
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

    // Check if this specific student has this book issued and not returned
    const activeIssue = await Transaction.findOne({
      studentId,
      bookId,
      status: { $in: ["active", "overdue"] },
    });

    if (!activeIssue) {
      return res.status(400).json({
        message: "No active issue found for this student and book",
      });
    }

    // Calculate fine if overdue
    const returnDate = new Date(); // Today's return date
    const dueDate = new Date(activeIssue.dueDate);
    let fineAmount = 0;
    let daysOverdue = 0;

    if (returnDate > dueDate) {
      const timeDiff = returnDate.getTime() - dueDate.getTime();
      daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
      fineAmount = daysOverdue * 5; // ₹5 per day
    }

    // Create return transaction and update book
    const [returnTransaction] = await Promise.all([
      new Transaction({
        studentId,
        bookId,
        type: "return",
        issueDate: activeIssue.issueDate, // Keep original issue date
        dueDate: activeIssue.dueDate, // Keep original due date
        returnDate: returnDate, // Set today's return date
        status: "returned",
        fineAmount: fineAmount,
        daysOverdue: daysOverdue,
        finePaid: fineAmount === 0, // Auto-mark as paid if no fine
      }).save(),
      Book.findByIdAndUpdate(
        bookId,
        {
          $inc: { availableCopies: 1 },
        },
        { new: true }
      ),
      // Update the original issue transaction status to returned
      Transaction.findByIdAndUpdate(activeIssue._id, {
        status: "returned",
        returnDate: returnDate,
      }),
    ]);

    await returnTransaction.populate("studentId", "name rollNo email");
    await returnTransaction.populate("bookId", "title author isbn");

    const response = {
      message: "Book returned successfully",
      transaction: returnTransaction,
      availableCopies: book.availableCopies + 1,
      returnDate: returnDate.toISOString().split("T")[0], // Return formatted return date
    };

    // Add fine information if applicable
    if (fineAmount > 0) {
      response.fineInfo = {
        daysOverdue: daysOverdue,
        fineAmount: fineAmount,
        message: `Fine of ₹${fineAmount} applied for ${daysOverdue} day(s) overdue`,
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Return book error:", error);
    next(error);
  }
};

/**
 * @desc Get all transactions (exclude returned books from active view)
 * @route GET /api/transactions
 * @access Public
 */
const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      studentId,
      bookId,
      type,
      status,
      showReturned = false,
    } = req.query;

    const filter = {};

    // Filter by query parameters
    if (studentId) filter.studentId = studentId;
    if (bookId) filter.bookId = bookId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    // By default, don't show returned transactions unless explicitly requested
    if (!showReturned && !status) {
      filter.status = { $in: ["active", "overdue"] };
    }

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
 * @desc Get active issues for a student (exclude returned books)
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
      status: { $in: ["active", "overdue"] },
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
 * @desc Get student's transaction history (include all including returned)
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
      status: { $in: ["active", "overdue"] },
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

/**
 * @desc Get overdue books with fines
 * @route GET /api/transactions/overdue
 * @access Public
 */
const getOverdueBooks = async (req, res, next) => {
  try {
    const overdueBooks = await Transaction.find({
      status: "overdue",
      type: "issue",
    })
      .populate("studentId", "name rollNo email")
      .populate("bookId", "title author isbn")
      .sort({ dueDate: 1 });

    // Calculate current fines for overdue books
    const overdueWithCurrentFines = overdueBooks.map((transaction) => {
      const dueDate = new Date(transaction.dueDate);
      const today = new Date();
      const timeDiff = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const currentFine = daysOverdue * 5;

      return {
        ...transaction.toObject(),
        currentDaysOverdue: daysOverdue,
        currentFine: currentFine,
      };
    });

    res.json({
      overdueBooks: overdueWithCurrentFines,
      totalOverdue: overdueWithCurrentFines.length,
      totalFine: overdueWithCurrentFines.reduce(
        (sum, book) => sum + book.currentFine,
        0
      ),
    });
  } catch (error) {
    console.error("Get overdue books error:", error);
    next(error);
  }
};

/**
 * @desc Pay fine for a transaction
 * @route POST /api/transactions/pay-fine
 * @access Public
 */
const payFine = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "transactionId is required" });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        finePaid: true,
        status: "returned",
      },
      { new: true }
    )
      .populate("studentId", "name rollNo email")
      .populate("bookId", "title author isbn");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      message: `Fine of ₹${transaction.fineAmount} paid successfully`,
      transaction,
    });
  } catch (error) {
    console.error("Pay fine error:", error);
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
  getOverdueBooks,
  payFine,
};
