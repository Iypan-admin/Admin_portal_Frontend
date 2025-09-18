import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getPendingEliteCards,
    getApprovedEliteCards,
    approveEliteCard,
    rejectEliteCard,
} from "../services/Api";

const EliteCardPaymentsPage = () => {
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [search, setSearch] = useState(""); // ✅ search state

    const loadAllCards = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const pending = await getPendingEliteCards(token);
            const approved = await getApprovedEliteCards(token);
            setAllCards([...(pending || []), ...(approved || [])]);
        } catch (error) {
            console.error("Error loading cards:", error);
            setAllCards([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this card?")) return;
        try {
            setActionLoading(id);
            const token = localStorage.getItem("token");
            await approveEliteCard(id, token);
            alert("✅ Card approved!");
            await loadAllCards();
        } catch (err) {
            console.error("Approval failed:", err);
            alert("❌ Failed to approve.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this card?")) return;
        try {
            setActionLoading(id);
            const token = localStorage.getItem("token");
            await rejectEliteCard(id, token);
            alert("🚫 Card rejected!");
            await loadAllCards();
        } catch (err) {
            console.error("Reject failed:", err);
            alert("❌ Failed to reject.");
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        loadAllCards();
    }, []);

    // ✅ Filtered cards based on search
    const filteredCards = allCards.filter((card) =>
        card.name_on_the_pass?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            <Navbar />
            <div className="flex-1 p-4 sm:p-6 lg:ml-64">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Elite Cards (Pending / Approved / Rejected)
                </h2>
                <p className="text-sm text-gray-600 mb-4">Manage and view all Elite card requests</p>

                {/* ✅ Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-1/3 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : filteredCards.length === 0 ? (
                    <p className="text-gray-500">No cards found.</p>
                ) : (
                    <div className="overflow-x-auto border rounded-lg bg-white shadow-md">
                        <div className="max-h-[420px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2">Full Name</th>
                                        <th className="px-3 py-2">Card Name</th>
                                        <th className="px-3 py-2">Card Number</th>
                                        <th className="px-3 py-2">Valid From</th>
                                        <th className="px-3 py-2">Valid Thru</th>
                                        <th className="px-3 py-2">Pass</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCards.map((card) => (
                                        <React.Fragment key={card.id}>
                                            <tr>
                                                <td className="px-3 py-2">{card.name_on_the_pass}</td>
                                                <td className="px-3 py-2">{card.card_name}</td>
                                                <td className="px-3 py-2">{card.card_number || "-"}</td>
                                                <td className="px-3 py-2">{card.valid_from || "-"}</td>
                                                <td className="px-3 py-2">{card.valid_thru || "-"}</td>
                                                <td className="px-3 py-2 text-blue-600">
                                                    {card.pdf_url ? (
                                                        <button
                                                            onClick={() =>
                                                                setExpandedRowId(
                                                                    expandedRowId === card.id ? null : card.id
                                                                )
                                                            }
                                                            className="underline text-blue-600 hover:text-blue-800"
                                                        >
                                                            {expandedRowId === card.id ? "Hide Pass" : "View Pass"}
                                                        </button>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 font-semibold">{card.status}</td>
                                                <td className="px-3 py-2">
                                                    {card.status === "card_generated" && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleApprove(card.id)}
                                                                disabled={actionLoading === card.id}
                                                                className="text-green-600 border border-green-500 px-2 py-1 rounded hover:bg-green-50 text-xs sm:text-sm disabled:opacity-50"
                                                            >
                                                                {actionLoading === card.id ? "Approving..." : "Approve"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(card.id)}
                                                                disabled={actionLoading === card.id}
                                                                className="text-red-600 border border-red-500 px-2 py-1 rounded hover:bg-red-50 text-xs sm:text-sm disabled:opacity-50"
                                                            >
                                                                {actionLoading === card.id ? "Rejecting..." : "Reject"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>

                                            {/* ✅ PDF Row Expand */}
                                            {expandedRowId === card.id && card.pdf_url && (
                                                <tr>
                                                    <td colSpan="8" className="px-3 py-4 bg-gray-50">
                                                        <iframe
                                                            src={card.pdf_url}
                                                            title="PDF Preview"
                                                            className="w-full h-[400px] border rounded"
                                                        ></iframe>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EliteCardPaymentsPage;
