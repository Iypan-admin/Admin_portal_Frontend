import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchPendingCards, approveCardById } from "../services/Api";

const ApprovedCardPage = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPendingCards = async () => {
        try {
            setLoading(true);
            const data = await fetchPendingCards();
            setCards(data);
        } catch (error) {
            console.error("Error loading cards:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveCardById(id);
            await loadPendingCards(); // refresh list
        } catch (err) {
            console.error("Approval failed:", err);
        }
    };

    useEffect(() => {
        loadPendingCards();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            <Navbar />
            <div className="flex-1 p-4 sm:p-6 lg:ml-64">
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Pending Card Approvals</h2>
                        <p className="mt-1 text-sm text-gray-600">Cards awaiting finance approval</p>
                    </div>

                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : cards.length === 0 ? (
                        <p className="text-gray-500">No pending cards.</p>
                    ) : (
                        <div className="overflow-x-auto border rounded-lg bg-white shadow-md">
                            <div className="max-h-[420px] overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Card No</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Card Name</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase hidden sm:table-cell">Card Type</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Payment ID</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase hidden sm:table-cell">Payment Date</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {cards.map((card) => (
                                            <tr key={card.id}>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">{card.card_no}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">{card.card_name}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700 hidden sm:table-cell">{card.card_type}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">{card.payment_id}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700 hidden sm:table-cell">{card.payment_date}</td>
                                                <td className="px-3 py-2 sm:px-4">
                                                    <button
                                                        onClick={() => handleApprove(card.id)}
                                                        className="text-green-600 border border-green-500 px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-green-50 text-xs sm:text-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );


};

export default ApprovedCardPage;
