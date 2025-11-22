// [file name]: Sidebar.jsx - UPDATED
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const navClass = ({ isActive }) =>
        `block p-2 rounded transition-colors ${isActive
            ? "bg-sky-100 text-sky-700 font-medium"
            : "text-gray-600 hover:bg-sky-50 hover:text-sky-600"
        }`;

    return (
        <div className="w-64 bg-white border-r shadow-sm">
            <div className="p-4 font-bold text-xl text-sky-800 border-b">📚 Library App</div>
            <nav className="p-4 space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Librarian</div>
                <NavLink to="/librarian/dashboard" className={navClass}>📊 Dashboard</NavLink>
                <NavLink to="/librarian/add-book" className={navClass}>➕ Add Book</NavLink>
                <NavLink to="/librarian/add-student" className={navClass}>👨‍🎓 Add Student</NavLink>
                <NavLink to="/librarian/view-books" className={navClass}>📖 View Books</NavLink>

                <div className="mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Student</div>
                <NavLink to="/student/dashboard" className={navClass}>📊 Dashboard</NavLink>
                <NavLink to="/student/qr-scanner" className={navClass}>📷 Scan QR Book</NavLink> {/* UPDATED */}
                <NavLink to="/student/books" className={navClass}>📚 My Books & Transactions</NavLink> {/* UPDATED */}
            </nav>
        </div>
    );
}