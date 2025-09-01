import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { uploadGiveawayCSV, getAllGiveaways, addGiveawayManual } from "../services/Api";

const ActivateCardPage = () => {
    const [allData, setAllData] = useState([]);
    const [uploadMessage, setUploadMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        cardName: "",
        city: "",
        email: "",
        contact: "",
    });

    // ✅ Fetch data
    const fetchData = async () => {
        try {
            const response = await getAllGiveaways();
            if (response && Array.isArray(response)) {
                setAllData(
                    response.map((item) => ({
                        referenceId: item.reference_id,
                        name: item.name_on_the_pass,
                        cardName: item.card_name,
                        city: item.city,
                        email: item.customer_email,
                        contact: item.customer_phone,
                        status:
                            item.status === "success"
                                ? "Success"
                                : item.status === "card_generated"
                                    ? "Card Generated"
                                    : item.status === "approved"
                                        ? "Approved"
                                        : item.status,
                        createdAt: new Date(item.created_at).toLocaleDateString(),
                    }))
                );
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ✅ CSV Upload
    const handleCSVUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const res = await uploadGiveawayCSV(file);
            if (res?.status === "ok") {
                setUploadMessage(`✅ ${res.inserted} rows uploaded successfully!`);
                fetchData();
            } else {
                setUploadMessage("❌ Upload failed. Check your CSV format.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setUploadMessage("❌ Upload failed. Try again.");
        }
    };

    // ✅ Status Colors
    const getStatusClass = (status) => {
        switch (status) {
            case "Success":
            case "Approved":
                return "bg-green-100 text-green-800";
            case "Card Generated":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // ✅ Input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Manual Insert
    const handleInsertGiveaway = async (e) => {
        e.preventDefault();
        try {
            const newEntry = {
                name_on_the_pass: formData.name,
                card_name: formData.cardName,
                city: formData.city,
                customer_email: formData.email,
                customer_phone: formData.contact,
            };

            const res = await addGiveawayManual(newEntry);

            if (res && !res.error) {
                alert(res.message || "✅ Giveaway entry added successfully!");
                fetchData();
                setIsModalOpen(false);
                setFormData({
                    name: "",
                    cardName: "",
                    city: "",
                    email: "",
                    contact: "",
                });
            } else {
                alert(`❌ Failed to insert giveaway. ${res.error || ""}`);
            }
        } catch (error) {
            console.error("Manual Insert Error:", error);
            alert("❌ Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            <Navbar />
            <div className="flex-1 p-4 sm:p-6 lg:ml-64">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    Giveaway Data
                </h1>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Upload */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Upload CSV
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm"
                        />
                        {uploadMessage && (
                            <p className="text-xs text-blue-600 mt-1">{uploadMessage}</p>
                        )}
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Reference ID / Name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </div>

                    {/* Download */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 invisible sm:visible">
                            Sample CSV
                        </label>
                        <a
                            href="/giveaway.csv"
                            download
                            className="block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg text-center"
                        >
                            Download Sample
                        </a>
                    </div>

                    {/* Insert */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 invisible sm:visible">
                            Insert New
                        </label>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="block bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg w-full"
                        >
                            Insert Giveaway
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
                    <div className="max-h-[420px] overflow-y-auto">
                        <table className="min-w-full text-xs sm:text-sm">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-2 text-left">Ref ID</th>
                                    <th className="px-3 py-2 text-left">Name</th>
                                    <th className="px-3 py-2 hidden sm:table-cell text-left">Card</th>
                                    <th className="px-3 py-2 hidden md:table-cell text-left">Email</th>
                                    <th className="px-3 py-2 hidden md:table-cell text-left">Contact</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                    <th className="px-3 py-2 hidden md:table-cell text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {allData.filter(
                                    (item) =>
                                        item.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
                                ).length > 0 ? (
                                    allData
                                        .filter(
                                            (item) =>
                                                item.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                item.name?.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2">{item.referenceId}</td>
                                                <td className="px-3 py-2">{item.name}</td>
                                                <td className="px-3 py-2 hidden sm:table-cell">{item.cardName}</td>
                                                <td className="px-3 py-2 hidden md:table-cell">{item.email}</td>
                                                <td className="px-3 py-2 hidden md:table-cell">{item.contact}</td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium ${getStatusClass(
                                                            item.status
                                                        )}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 hidden md:table-cell">{item.createdAt}</td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-4 text-sm text-gray-500"
                                        >
                                            No data. Upload CSV.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Insert New Giveaway</h2>
                        <form onSubmit={handleInsertGiveaway} className="space-y-3">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name on Pass" className="w-full border px-3 py-2 rounded" required />
                            <select name="cardName" value={formData.cardName} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
                                <option value="">-- Select Card --</option>
                                <option value="EduPass">EduPass</option>
                                <option value="ScholarPass">ScholarPass</option>
                                <option value="InfinitePass">InfinitePass</option>
                            </select>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full border px-3 py-2 rounded" />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Customer Email" className="w-full border px-3 py-2 rounded" />
                            <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="Customer Phone" className="w-full border px-3 py-2 rounded" />

                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
                                    Insert
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivateCardPage;
