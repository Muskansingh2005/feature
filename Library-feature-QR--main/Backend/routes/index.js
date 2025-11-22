// [file name]: routes/index.js - UPDATED
import express from "express";
import bookRoutes from "./bookRoutes.js";
import studentRoutes from "./studentRoutes.js";
import transactionRoutes from "./transactionRoutes.js";

const router = express.Router();

router.use("/books", bookRoutes);
router.use("/students", studentRoutes);
router.use("/transactions", transactionRoutes);

export default router;
