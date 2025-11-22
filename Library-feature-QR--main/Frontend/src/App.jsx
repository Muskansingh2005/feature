// [file name]: App.jsx - UPDATED
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import LibrarianDashboard from "./pages/librarian/Dashboard";
import AddBook from "./pages/librarian/AddBook";
import ViewBooks from "./pages/librarian/ViewBook";
import StudentDashboard from "./pages/student/Dashboard";
import ScanQR from "./pages/student/ScanQR";
import MyBooks from "./pages/student/MyBooks";
import AddStudent from "./pages/librarian/AddStudent";
import QRBookScanner from "./pages/student/QRBookScanner"; // NEW
import StudentBooks from "./pages/student/StudentBooks"; // NEW

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          {/* Redirect root to librarian dashboard */}
          <Route path="/" element={<Navigate to="/librarian/dashboard" replace />} />

          {/* Librarian Routes */}
          <Route path="/librarian/dashboard" element={<LibrarianDashboard />} />
          <Route path="/librarian/add-book" element={<AddBook />} />
          <Route path="/librarian/view-books" element={<ViewBooks />} />
          <Route path="/librarian/add-student" element={<AddStudent />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/scan-qr" element={<ScanQR />} />
          <Route path="/student/my-books" element={<MyBooks />} />
          {/* NEW ROUTES */}
          <Route path="/student/qr-scanner" element={<QRBookScanner />} />
          <Route path="/student/books" element={<StudentBooks />} />

          {/* 404 Fallback */}
          <Route path="*" element={<div className="p-8 text-center">Page Not Found</div>} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;