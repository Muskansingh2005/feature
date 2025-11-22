import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function MyBooks() {
    const [studentId, setStudentId] = useState("");
    const [students, setStudents] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        API.get("/students").then(res => {
            setStudents(res.data);
            if (res.data[0]) setStudentId(res.data[0]._id);
        }).catch(err => alert(err.message));
    }, []);

    useEffect(() => {
        if (!studentId) return;
        API.get("/transactions").then(res => {
            const filtered = res.data.filter(tx => tx.studentId._id === studentId);
            setTransactions(filtered);
        }).catch(err => alert(err.message));
    }, [studentId]);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">My Books & Transactions</h2>

            <div className="bg-white p-4 rounded shadow">
                <label className="block mb-2">Select Student:</label>
                <select value={studentId} onChange={e => setStudentId(e.target.value)} className="p-2 border rounded">
                    {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} — {s.rollNo}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-sky-200">
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Book</th>
                            <th className="p-2 text-left">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx._id} className="border-t">
                                <td className="p-2">{new Date(tx.date).toLocaleString()}</td>
                                <td className="p-2">{tx.bookId.title}</td>
                                <td className="p-2 capitalize">{tx.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
