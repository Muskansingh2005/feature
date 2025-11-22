/**
 * Seed Script
 * -----------
 * Populates database with sample Books and Students.
 * Run using: npm run seed
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Book from "../models/Book.js";
import Student from "../models/Student.js";

const seed = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Clear existing data
    await Book.deleteMany({});
    await Student.deleteMany({});

    // Sample books
    const books = await Book.insertMany([
      {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        isbn: "9780262033848",
        description: "A comprehensive guide to algorithms and data structures.",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        description: "A handbook of agile software craftsmanship.",
        totalCopies: 2,
        availableCopies: 2,
      },
      {
        title: "Design Patterns",
        author: "Erich Gamma et al.",
        isbn: "9780201633610",
        description: "Elements of reusable object-oriented software.",
        totalCopies: 1,
        availableCopies: 1,
      },
      {
        title: "You Don’t Know JS",
        author: "Kyle Simpson",
        isbn: "9781491904244",
        description: "Deep dive into JavaScript mechanics.",
        totalCopies: 4,
        availableCopies: 4,
      },
    ]);

    // Sample students
    const students = await Student.insertMany([
      { name: "Aarav Patel", email: "aarav@example.com", rollNo: "BTECH001" },
      { name: "Meera Sharma", email: "meera@example.com", rollNo: "BTECH002" },
      { name: "Ravi Kumar", email: "ravi@example.com", rollNo: "BTECH003" },
    ]);

    console.log("✅ Seeded sample data successfully!");
    console.log({
      booksInserted: books.length,
      studentsInserted: students.length,
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  }
};

seed();
