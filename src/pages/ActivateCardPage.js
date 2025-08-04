import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { uploadCSVData, getAllCardData } from "../services/Api";

const ActivateCardPage = () => {
    const [allData, setAllData] = useState([]);
    const [uploadMessage, setUploadMessage] = useState("");

    // 👇 Fetch data using service
    const fetchData = async () => {
        try {
            const response = await getAllCardData();
            if (response && Array.isArray(response)) {
                setAllData(
                    response.map((item) => ({
                        cardNo: item.card_no,
                        cardName: item.card_name,
                        cardType: item.card_type,
                        paymentId: item.payment_id,
                        paymentDate: item.payment_date,
                        status: item.status ? "Active" : "Inactive",
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

    // ✅ Handle CSV Upload as file (no Papa.parse)
    const handleCSVUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await uploadCSVData(file);
            if (res?.message === "Data uploaded successfully") {
                setUploadMessage("✅ CSV uploaded successfully!");
                fetchData();
            } else {
                setUploadMessage("❌ Upload failed. Check your CSV format.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setUploadMessage("❌ Upload failed. Try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            <Navbar />
            <div className="flex-1 lg:ml-64">
                <div className="p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto mb-6">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Activate Cards</h1>
                    </div>

                    {/* Upload CSV with Sample CSV Download */}
                    <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-end md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Upload CSV</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md text-sm"
                            />
                            {uploadMessage && (
                                <p className="text-sm text-blue-600 mt-2">{uploadMessage}</p>
                            )}
                        </div>

                        <div className="md:ml-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700 invisible md:visible">Sample CSV Format</label>
                            <a
                                href="/card.csv"
                                download
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg"
                            >
                                Download Sample CSV
                            </a>
                        </div>
                    </div>


                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-300 max-w-7xl mx-auto overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold border-b">Card No</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold border-b hidden sm:table-cell">Card Name</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold border-b hidden sm:table-cell">Card Type</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold border-b">Payment ID</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold border-b hidden sm:table-cell">Payment Date</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold border-b">Status</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        <div className="overflow-y-auto max-h-[370px]">
                            <table className="min-w-full bg-white">
                                <tbody className="text-gray-700">
                                    {allData.length > 0 ? (
                                        allData.map((item, index) => (
                                            <tr key={index} className="border-t border-gray-200">
                                                <td className="px-6 py-4 text-sm">{item.cardNo}</td>
                                                <td className="px-6 py-4 text-sm hidden sm:table-cell">{item.cardName}</td>
                                                <td className="px-6 py-4 text-sm hidden sm:table-cell">{item.cardType}</td>
                                                <td className="px-6 py-4 text-sm">{item.paymentId}</td>
                                                <td className="px-6 py-4 text-sm hidden sm:table-cell">{item.paymentDate}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                                                No data to display. Please upload a CSV.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivateCardPage;
