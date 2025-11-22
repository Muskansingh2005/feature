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
        // Fetch students
        API.get("/students")
            .then((res) => {
                setStudents(res.data);
                if (res.data[0]) setStudentId(res.data[0]._id);
            })
            .catch(() => toast.error("Failed to load students"));
    }, []);

    useEffect(() => {
        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const [activeRes, transactionsRes] = await Promise.all([
                API.get(`/transactions/student/${studentId}/active`),
                API.get(`/transactions?studentId=${studentId}&limit=100`)
            ]);

            setActiveIssues(activeRes.data.activeIssues);
            setAllTransactions(transactionsRes.data.transactions);
        } catch (error) {
            toast.error("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    const handleReturnBook = async (bookId) => {
        try {
            const res = await API.post("/transactions/return", {
                studentId,
                bookId
            });

            toast.success(res.data.message);
            fetchStudentData(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to return book");
        }
    };

    const getStatusBadge = (transaction) => {
        if (transaction.type === "return") {
            return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Returned</span>;
        }

        if (transaction.status === "active") {
            const dueDate = new Date(transaction.dueDate);
            const today = new Date();

            if (dueDate < today) {
                return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Overdue</span>;
            }

            return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Issued</span>;
        }

        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{transaction.status}</span>;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">My Books & Transactions</h2>

            {/* Student Selection */}
            <div className="bg-white p-4 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student:
                </label>
                <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {students.map((student) => (
                        <option key={student._id} value={student._id}>
                            {student.name} — {student.rollNo}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <>
                    {/* Currently Issued Books */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Currently Issued Books ({activeIssues.length})
                            </h3>
                        </div>

                        {activeIssues.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No books currently issued
                            </div>
                        ) : (
                            <div className="divide-y">
                                {activeIssues.map((issue) => (
                                    <div key={issue._id} className="p-4 flex justify-between items-center">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{issue.bookId.title}</h4>
                                            <p className="text-sm text-gray-600">by {issue.bookId.author}</p>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="text-sm text-gray-500">
                                                    Issued: {new Date(issue.issueDate).toLocaleDateString()}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Due: {new Date(issue.dueDate).toLocaleDateString()}
                                                </span>
                                                {getStatusBadge(issue)}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleReturnBook(issue.bookId._id)}
                                            className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Return
                                        </button>
                                    </div>
                                ))}
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {allTransactions.map((transaction) => (
                                            <tr key={transaction._id}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(transaction.issueDate || transaction.date).toLocaleDateString()}
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