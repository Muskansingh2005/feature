import React, { useState } from "react";
import API from "../../api/api";
import toast from "react-hot-toast";

export default function AddBook() {
    const [form, setForm] = useState({
        title: "",
        author: "",
        isbn: "",
        description: "",
        totalCopies: 1
    });
    const [qrDataUrl, setQrDataUrl] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/books", {
                title: form.title,
                author: form.author,
                isbn: form.isbn,
                description: form.description,
                totalCopies: Number(form.totalCopies)
            });
            setQrDataUrl(res.data.book.qrData);
            toast.success("Book added successfully!");
            setForm({ title: "", author: "", isbn: "", description: "", totalCopies: 1 });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Add New Book</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
                <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 border rounded" />
                <input name="author" value={form.author} onChange={handleChange} placeholder="Author" className="w-full p-2 border rounded" />
                <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="ISBN" className="w-full p-2 border rounded" />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
                <input name="totalCopies" type="number" min="1" value={form.totalCopies} onChange={handleChange} placeholder="Total Copies" className="w-full p-2 border rounded" />

                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
                    Add Book
                </button>
            </form>

            {qrDataUrl && (
                <div className="mt-6 bg-white p-6 rounded shadow text-center">
                    <h3 className="font-semibold mb-2">QR Code Generated</h3>
                    <img src={qrDataUrl} alt="QR" className="w-48 h-48 mx-auto mb-3" />
                    <a
                        href={qrDataUrl}
                        download="book_qr.png"
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Download QR PNG
                    </a>
                </div>
            )}
        </div>
    );
}
