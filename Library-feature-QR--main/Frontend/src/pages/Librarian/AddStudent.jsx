// [file name]: AddStudent.jsx - NEW FILE
import React, { useState } from "react";
import API from "../../api/api";
import toast from "react-hot-toast";

export default function AddStudent() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        rollNo: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await API.post("/students", form);
            toast.success("Student added successfully!");
            setForm({ name: "", email: "", rollNo: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Add New Student</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        required
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Roll Number *</label>
                    <input
                        name="rollNo"
                        value={form.rollNo}
                        onChange={handleChange}
                        placeholder="Enter roll number"
                        required
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:bg-sky-300 disabled:cursor-not-allowed"
                >
                    {loading ? "Adding..." : "Add Student"}
                </button>
            </form>
        </div>
    );
}