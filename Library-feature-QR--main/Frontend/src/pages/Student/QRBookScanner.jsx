// [file name]: QRBookScanner.jsx - ENHANCED WITH BETTER ERROR HANDLING
import React, { useState, useEffect } from "react";
import API from "../../api/api";
import toast from "react-hot-toast";

export default function QRBookScanner() {
    const [scannedBookId, setScannedBookId] = useState("");
    const [bookDetails, setBookDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);

    // Fetch students and books on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, booksRes] = await Promise.all([
                API.get("/students"),
                API.get("/books")
            ]);
            setStudents(studentsRes.data);
            setBooks(booksRes.data);
            if (studentsRes.data[0]) setStudentId(studentsRes.data[0]._id);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Failed to load students and books data");
        }
    };

    const handleQRScan = async (bookId) => {
        if (!bookId.trim()) {
            toast.error("Please enter a Book ID");
            return;
        }

        // Validate Book ID format (MongoDB ObjectId is 24 characters)
        if (bookId.length !== 24) {
            toast.error("Invalid Book ID format. Book ID should be 24 characters long.");
            return;
        }

        setScannedBookId(bookId);
        await fetchBookDetails(bookId);
    };

    const fetchBookDetails = async (bookId) => {
        try {
            setLoading(true);
            console.log("Fetching book with ID:", bookId);

            const res = await API.get(`/books/${bookId}`);
            console.log("Book found:", res.data);

            setBookDetails(res.data);
            setShowModal(true);
        } catch (error) {
            console.error("Book fetch error:", error);

            if (error.response?.status === 404) {
                toast.error(`Book not found with ID: ${bookId}`);
            } else {
                toast.error("Failed to fetch book details. Check backend connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleIssueBook = async () => {
        if (!studentId) {
            toast.error("Please select a student");
            return;
        }

        try {
            const res = await API.post("/transactions/issue", {
                studentId,
                bookId: scannedBookId,
            });

            toast.success(res.data.message);
            setShowModal(false);
            setScannedBookId("");
            setBookDetails(null);

            // Refresh books list to update availability
            await fetchData();
        } catch (error) {
            console.error("Issue book error:", error);
            toast.error(error.response?.data?.message || "Failed to issue book");
        }
    };

    const handleReturnBook = async () => {
        if (!studentId) {
            toast.error("Please select a student");
            return;
        }

        try {
            const res = await API.post("/transactions/return", {
                studentId,
                bookId: scannedBookId,
            });

            toast.success(res.data.message);
            setShowModal(false);
            setScannedBookId("");
            setBookDetails(null);

            // Refresh books list to update availability
            await fetchData();
        } catch (error) {
            console.error("Return book error:", error);
            toast.error(error.response?.data?.message || "Failed to return book");
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        handleQRScan(scannedBookId.trim());
    };

    const copyBookId = async (bookId) => {
        try {
            await navigator.clipboard.writeText(bookId);
            setScannedBookId(bookId);
            toast.success("Book ID copied! Now click 'Scan Book'");
        } catch {
            toast.error("Copy failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">QR Book Scanner</h2>

                {/* Connection Status */}
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Make sure backend server is running on http://localhost:5000
                    </p>
                </div>

                {/* Student Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Student *
                    </label>
                    <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                            <option key={student._id} value={student._id}>
                                {student.name} ({student.rollNo})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Manual Book ID Input */}
                <form onSubmit={handleManualSubmit} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Book ID (24 characters)
                        </label>
                        <input
                            type="text"
                            value={scannedBookId}
                            onChange={(e) => setScannedBookId(e.target.value)}
                            placeholder="Paste Book ID from QR code or select from list below"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Book ID should be 24 characters like: 69184f1f096a37adf8642ce8
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !scannedBookId.trim()}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {loading ? "Loading Book Details..." : "Scan Book"}
                    </button>
                </form>

                {/* Available Books List */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Available Books (Click to copy Book ID)
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {books.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No books available</p>
                        ) : (
                            books.map((book) => (
                                <div
                                    key={book._id}
                                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => copyBookId(book._id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{book.title}</div>
                                            <div className="text-sm text-gray-600">by {book.author}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Available: {book.availableCopies}/{book.totalCopies} •
                                                ID: <code className="bg-gray-100 px-1 rounded">{book._id}</code>
                                            </div>
                                        </div>
                                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                                            Copy ID
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <p className="mt-4 text-sm text-gray-600 text-center">
                    📷 Point your camera at a book's QR code, or manually enter the Book ID above
                </p>
            </div>

            {/* Book Details Modal */}
            {showModal && bookDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Book Details</h3>

                        <div className="space-y-3 mb-6">
                            <div>
                                <strong>Title:</strong> {bookDetails.title}
                            </div>
                            <div>
                                <strong>Author:</strong> {bookDetails.author}
                            </div>
                            <div>
                                <strong>Description:</strong> {bookDetails.description || "No description"}
                            </div>
                            <div>
                                <strong>Available Copies:</strong> {bookDetails.availableCopies} / {bookDetails.totalCopies}
                            </div>
                            <div>
                                <strong>Book ID:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{bookDetails._id}</code>
                            </div>
                        </div>

                        {/* QR Code Display */}
                        {bookDetails.qrData && (
                            <div className="text-center mb-4">
                                <img
                                    src={bookDetails.qrData}
                                    alt="QR Code"
                                    className="w-32 h-32 mx-auto mb-2"
                                />
                                <p className="text-sm text-gray-600">Book QR Code</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={handleIssueBook}
                                disabled={bookDetails.availableCopies <= 0}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                            >
                                {bookDetails.availableCopies <= 0 ? 'No Copies Available' : 'Issue Book'}
                            </button>
                            <button
                                onClick={handleReturnBook}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                            >
                                Return Book
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}