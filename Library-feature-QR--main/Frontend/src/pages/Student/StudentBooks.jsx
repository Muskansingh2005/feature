// [file name]: StudentBooks.jsx - UPDATED (WITH FINE SYSTEM & FIXED DATES)
import React, { useState, useEffect } from "react";
import API from "../../api/api";
import toast from "react-hot-toast";

export default function StudentBooks() {
    const [studentId, setStudentId] = useState("");
    const [students, setStudents] = useState([]);
    const [activeIssues, setActiveIssues] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudents = async () => {
        try {
            const res = await API.get("/students");
            setStudents(res.data);
            if (res.data[0]) setStudentId(res.data[0]._id);
        } catch (error) {
            toast.error("Failed to load students");
        }
    };

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            // Use the new endpoints without authentication
            const [activeRes, transactionsRes] = await Promise.all([
                API.get(`/transactions/active/${studentId}`),
                API.get(`/transactions/student/${studentId}`)
            ]);

            setActiveIssues(activeRes.data.activeIssues || []);
            setAllTransactions(transactionsRes.data.transactions || []);
        } catch (error) {
            console.error("Failed to load student data:", error);
            toast.error("Failed to load your data");
        } finally {
            setLoading(false);
        }
    };

    // Function to calculate and display fines
    const calculateFine = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);

        if (today > due) {
            const timeDiff = today.getTime() - due.getTime();
            const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return {
                daysOverdue,
                amount: daysOverdue * 5,
                isOverdue: true
            };
        }

        return {
            daysOverdue: 0,
            amount: 0,
            isOverdue: false
        };
    };

    // Update the status badge to show fines
    const getStatusBadge = (transaction) => {
        if (transaction.type === "return") {
            return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Returned</span>;
        }

        if (transaction.status === "active") {
            const fineInfo = calculateFine(transaction.dueDate);
            if (fineInfo.isOverdue) {
                return (
                    <div className="flex flex-col space-y-1">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Overdue</span>
                        <span className="text-xs text-red-600">Fine: ₹{fineInfo.amount}</span>
                    </div>
                );
            }
            return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Issued</span>;
        }

        if (transaction.status === "overdue") {
            const fineInfo = calculateFine(transaction.dueDate);
            return (
                <div className="flex flex-col space-y-1">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Overdue</span>
                    <span className="text-xs text-red-600">Fine: ₹{fineInfo.amount}</span>
                </div>
            );
        }

        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{transaction.status}</span>;
    };

    const handleReturnBook = async (bookId) => {
        try {
            const res = await API.post("/transactions/return", {
                studentId,
                bookId
            });

            if (res.data.fineInfo) {
                toast.success(`${res.data.message} - ${res.data.fineInfo.message}`);
            } else {
                toast.success(res.data.message);
            }

            fetchStudentData(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to return book");
        }
    };

    // Calculate total fine for active issues
    const calculateTotalFine = () => {
        return activeIssues.reduce((total, issue) => {
            const fineInfo = calculateFine(issue.dueDate);
            return total + fineInfo.amount;
        }, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Books & Transactions</h2>
            </div>

            {/* Student Selection */}
            <div className="bg-white p-4 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student:
                </label>
                <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select a student</option>
                    {students.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.name} — {s.rollNo}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <>
                    {/* Fine Summary */}
                    {activeIssues.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-800">Fine Summary</h3>
                                    <p className="text-sm text-yellow-600">
                                        Total potential fine for all overdue books: <strong>₹{calculateTotalFine()}</strong>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-yellow-600">
                                        Fine Rate: ₹5 per day per book
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Currently Issued Books */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Currently Issued Books ({activeIssues.length})
                                </h3>
                                {calculateTotalFine() > 0 && (
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Total Fine: ₹{calculateTotalFine()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {activeIssues.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No books currently issued
                            </div>
                        ) : (
                            <div className="divide-y">
                                {activeIssues.map((issue) => {
                                    const fineInfo = calculateFine(issue.dueDate);
                                    return (
                                        <div key={issue._id} className="p-4 flex justify-between items-center">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{issue.bookId.title}</h4>
                                                <p className="text-sm text-gray-600">by {issue.bookId.author}</p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    {/* FIXED: Date display with Indian format */}
                                                    <span className="text-sm text-gray-500">
                                                        Issued: {new Date(issue.issueDate).toLocaleDateString('en-IN')}
                                                    </span>
                                                    <span className={`text-sm ${fineInfo.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                                        Due: {new Date(issue.dueDate).toLocaleDateString('en-IN')}
                                                    </span>
                                                    {getStatusBadge(issue)}
                                                </div>
                                                {fineInfo.isOverdue && (
                                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                                        <p className="text-sm text-red-700">
                                                            <strong>Overdue by {fineInfo.daysOverdue} day(s)</strong> -
                                                            Fine: ₹{fineInfo.amount} (₹5 per day)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleReturnBook(issue.bookId._id)}
                                                className={`ml-4 px-4 py-2 rounded font-medium ${fineInfo.isOverdue
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                {fineInfo.isOverdue ? 'Return with Fine' : 'Return'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                        </div>

                        {allTransactions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No transactions found
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Book
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fine
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {allTransactions.map((transaction) => (
                                            <tr key={transaction._id}>
                                                {/* FIXED: Date display with Indian format */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(transaction.issueDate).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.bookId.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.bookId.author}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                    {transaction.type}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {getStatusBadge(transaction)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {transaction.fineAmount > 0 ? (
                                                        <span className={`px-2 py-1 rounded-full text-xs ${transaction.finePaid
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            ₹{transaction.fineAmount} {transaction.finePaid ? '(Paid)' : '(Pending)'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}