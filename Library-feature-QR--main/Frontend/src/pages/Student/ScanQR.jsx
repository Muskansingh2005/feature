import React, { useState, useEffect, useRef } from "react";
import API from "../../api/api";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanQR() {
    const [studentId, setStudentId] = useState("");
    const [students, setStudents] = useState([]);
    const [bookIdManual, setBookIdManual] = useState("");
    const [cameraAvailable, setCameraAvailable] = useState(true);
    const html5QrcodeRef = useRef(null);
    const qrRegionId = "html5qr-reader";

    useEffect(() => {
        API.get("/students")
            .then((res) => {
                setStudents(res.data);
                if (res.data[0]) setStudentId(res.data[0]._id);
            })
            .catch(() => toast.error("Failed to load students"));
    }, []);

    const processScan = async (text) => {
        if (!text) return;
        const trimmed = text.trim();
        let endpoint, body;

        if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
            endpoint = "/transactions/issue";
            body = { studentId, bookId: trimmed };
        } else if (trimmed.includes("/return")) {
            const id = trimmed.split("/return/")[1];
            endpoint = "/transactions/return";
            body = { studentId, bookId: id };
        } else {
            toast.error("Invalid QR data");
            return;
        }

        try {
            const res = await API.post(endpoint, body);
            toast.success(res.data.message || "Transaction successful!");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    // start the camera scanner
    useEffect(() => {
        // Check if DOM element exists before initializing
        const qrElement = document.getElementById(qrRegionId);
        if (!qrElement) {
            console.warn(`QR element with ID "${qrRegionId}" not found`);
            return;
        }

        // create instance
        const html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrcodeRef.current = html5QrCode;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            // remember to allowLargeScanRegions if needed
        };

        // start camera
        html5QrCode
            .start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    // success callback
                    processScan(decodedText);
                },
                (errorMessage) => {
                    // parse scan failure messages if you want
                    // console.debug("QR scan error:", errorMessage);
                }
            )
            .catch((err) => {
                console.error("html5-qrcode start failed:", err);
                // handle permission denied specifically
                if (err && err.name === "NotAllowedError") {
                    toast.error("Camera permission denied");
                    setCameraAvailable(false);
                } else {
                    // other errors, disable camera UI as fallback
                    setCameraAvailable(false);
                }
            });

        // cleanup on unmount
        return () => {
            if (html5QrcodeRef.current) {
                html5QrcodeRef.current
                    .stop()
                    .then(() => {
                        html5QrcodeRef.current.clear();
                    })
                    .catch((e) => {
                        // ignore stop errors
                        console.warn("Failed to stop html5Qrcode", e);
                    });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]); // re-run only when studentId is set/changes

    // manual file upload (optional): scan QR from an uploaded image
    const handleFileUpload = async (file) => {
        if (!file) return;
        try {
            // scanFileV2 returns a promise resolving with decoded text or throws
            const result = await Html5Qrcode.scanFileV2(file, /*showImage=*/ false);
            if (result?.decodedText) {
                processScan(result.decodedText);
            } else {
                toast.error("No QR found in image");
            }
        } catch (err) {
            console.error("scanFileV2 error:", err);
            toast.error("Failed to decode uploaded image");
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-sky-700">📷 Scan Book QR</h2>

            <div className="bg-white p-4 rounded shadow">
                <label className="block mb-2 font-medium">Select Student:</label>
                <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="p-2 border rounded w-full"
                >
                    {students.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.name} — {s.rollNo}
                        </option>
                    ))}
                </select>
            </div>

            {cameraAvailable ? (
                <div className="bg-white p-4 rounded shadow">
                    <div id={qrRegionId} style={{ width: "100%" }} />
                    <p className="text-gray-600 text-sm mt-2 text-center">
                        Point your camera at the book’s QR code. If camera fails, use fallback below.
                    </p>
                </div>
            ) : (
                <div className="bg-white p-4 rounded shadow space-y-2">
                    <p className="text-sm text-gray-600">
                        Camera not available. Use manual input or upload QR image.
                    </p>

                    <input
                        type="text"
                        value={bookIdManual}
                        onChange={(e) => setBookIdManual(e.target.value)}
                        placeholder="Enter Book ID (24-char ObjectId) or return URL"
                        className="w-full p-2 border rounded"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={() => processScan(bookIdManual)}
                            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                        >
                            Submit
                        </button>

                        <label className="px-4 py-2 bg-gray-100 border rounded cursor-pointer">
                            Upload QR image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
