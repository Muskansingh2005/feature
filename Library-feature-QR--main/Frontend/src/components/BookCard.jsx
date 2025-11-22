// [file name]: BookCard.jsx - UPDATED
import React, { useState } from "react";

export default function BookCard({ book, onViewQR }) {
    const [showBookId, setShowBookId] = useState(false);

    const copyBookId = async () => {
        try {
            await navigator.clipboard.writeText(book._id);
            alert("Book ID copied to clipboard!");
        } catch {
            alert("Copy failed");
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="text-lg font-semibold">{book.title}</div>
                    <div className="text-sm text-slate-500">{book.author} • ISBN: {book.isbn}</div>
                    <div className="text-sm text-slate-500">Available: {book.availableCopies} / {book.totalCopies}</div>

                    {/* Book ID Section */}
                    <div className="mt-2">
                        <button
                            onClick={() => {
                                setShowBookId(!showBookId);
                                if (!showBookId) {
                                    copyBookId();
                                }
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                        >
                            {showBookId ? 'Hide Book ID' : 'Copy Book ID'}
                        </button>
                        {showBookId && (
                            <div className="mt-1 text-xs bg-yellow-50 p-2 rounded border">
                                <code>{book._id}</code>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => onViewQR(book)}
                    className="ml-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                >
                    View QR
                </button>
            </div>
        </div>
    );
}