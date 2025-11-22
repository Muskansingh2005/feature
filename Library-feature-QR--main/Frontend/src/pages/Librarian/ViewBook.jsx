// [file name]: ViewBook.jsx - FIXED
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import BookCard from "../../components/BookCard";
import toast from "react-hot-toast";

export default function ViewBooks() {
    const [books, setBooks] = useState([]);
    const [modalBook, setModalBook] = useState(null);
    const [showBookId, setShowBookId] = useState(null);

    useEffect(() => {
        API.get("/books")
            .then((res) => setBooks(res.data))
            .catch((err) => toast.error(err.message));
    }, []);

    const copyBookId = async (bookId) => {
        try {
            await navigator.clipboard.writeText(bookId);
            toast.success("Book ID copied to clipboard!");
        } catch {
            toast.error("Copy failed");
        }
    };

    const copyQrData = async (dataUrl) => {
        try {
            await navigator.clipboard.writeText(dataUrl);
            toast.success("QR data URL copied!");
        } catch {
            toast.error("Copy failed");
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">View Books</h2>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Each book has a unique Book ID. Click "Show Book ID" to copy it for QR scanning.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                    <div key={book._id} className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="text-lg font-semibold">{book.title}</div>
                                <div className="text-sm text-slate-500">{book.author} • ISBN: {book.isbn}</div>
                                <div className="text-sm text-slate-500">Available: {book.availableCopies} / {book.totalCopies}</div>

                                {/* Book ID Section */}
                                <div className="mt-2 p-2 bg-gray-50 rounded border">
                                    <div className="text-xs text-gray-500 mb-1">Book ID:</div>
                                    <div className="flex items-center justify-between">
                                        <code className="text-xs bg-white px-2 py-1 border rounded">
                                            {showBookId === book._id ? book._id : '••••••••••••'}
                                        </code>
                                        <button
                                            onClick={() => {
                                                setShowBookId(showBookId === book._id ? null : book._id);
                                                if (showBookId !== book._id) {
                                                    copyBookId(book._id);
                                                }
                                            }}
                                            className="ml-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                        >
                                            {showBookId === book._id ? 'Hide' : 'Copy Book ID'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalBook(book)}
                                className="ml-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                            >
                                View QR
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Modal */}
            {modalBook && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
                        <h3 className="font-semibold mb-2">{modalBook.title} – QR Code</h3>
                        <img src={modalBook.qrData} alt="QR Code" className="w-64 h-64 mx-auto mb-4" />

                        {/* Book ID in QR Modal */}
                        <div className="mb-4 p-3 bg-gray-50 rounded border">
                            <div className="text-sm text-gray-600 mb-1">Book ID for manual entry:</div>
                            <div className="flex items-center justify-center space-x-2">
                                <code className="text-sm bg-white px-3 py-1 border rounded">
                                    {modalBook._id}
                                </code>
                                <button
                                    onClick={() => copyBookId(modalBook._id)}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="space-x-2">
                            <button
                                onClick={() => copyQrData(modalBook.qrData)}
                                className="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                            >
                                Copy QR Data URL
                            </button>
                            {/* FIXED: Properly closed <a> tag */}
                            <a
                                href={modalBook.qrData}
                                download={`${modalBook.title}_QR.png`}
                                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
                            >
                                Download PNG
                            </a>
                        </div>
                        <button
                            onClick={() => setModalBook(null)}
                            className="mt-4 block mx-auto px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}