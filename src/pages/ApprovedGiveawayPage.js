import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getPendingGiveaways,
    approveGiveaway,
    declineGiveaway,
} from "../services/Api";

const GiveawayApprovalPage = () => {
    const [giveaways, setGiveaways] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Search & filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all | success | approved | declined

    const loadPendingGiveaways = async () => {
        try {
            setLoading(true);
            const data = await getPendingGiveaways();
            setGiveaways(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading giveaways:", error);
            setGiveaways([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this giveaway?")) return;
        try {
            setActionLoading(id);
            const response = await approveGiveaway(id);
            alert(`✅ ${response?.message || "Giveaway approved successfully!"}`);
            await loadPendingGiveaways();
        } catch (err) {
            console.error(`Approval failed [ID: ${id}]:`, err);
            alert(`❌ Failed to approve giveaway: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (id) => {
        if (!window.confirm("Are you sure you want to decline this giveaway?")) return;
        try {
            setActionLoading(id);
            const response = await declineGiveaway(id);
            alert(`🚫 ${response?.message || "Giveaway declined successfully!"}`);
            await loadPendingGiveaways();
        } catch (err) {
            console.error(`Decline failed [ID: ${id}]:`, err);
            alert(`❌ Failed to decline giveaway: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        loadPendingGiveaways();
    }, []);

    const formatStatus = (status) => {
        if (status === "success") return "Pending Approval";
        return status?.charAt(0).toUpperCase() + status?.slice(1);
    };

    // Filter & search logic
    const filteredGiveaways = giveaways.filter((g) => {
        const matchesSearch =
            g.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.name_on_the_pass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.card_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === "all" ? true : g.status.toLowerCase() === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            <Navbar />
            <div className="flex-1 p-4 sm:p-6 lg:ml-64">
                <div className="space-y-4 sm:space-y-6">
                    {/* Header + Search/Filter */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Giveaway Approvals
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Giveaway entries awaiting admin approval
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by Ref ID, Name, Card, City, Email, Contact"
                                className="px-3 py-2 border rounded-md text-sm w-full sm:w-72"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="px-3 py-2 border rounded-md text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="success">Pending Approval</option>
                                <option value="approved">Approved</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : filteredGiveaways.length === 0 ? (
                        <p className="text-gray-500">No giveaways match your search/filter.</p>
                    ) : (
                        <div className="overflow-x-auto border rounded-lg bg-white shadow-md">
                            <div className="max-h-[420px] overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">Reference ID</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">Name</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">Card</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">City</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">Email</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">Contact</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredGiveaways.map((g) => (
                                            <tr key={g.id}>
                                                <td className="px-3 py-2 text-gray-700">{g.reference_id}</td>
                                                <td className="px-3 py-2 text-gray-700">{g.name_on_the_pass}</td>
                                                <td className="px-3 py-2 text-gray-700">{g.card_name || "-"}</td>
                                                <td className="px-3 py-2 text-gray-700">{g.city || "-"}</td>
                                                <td className="px-3 py-2 text-gray-700">{g.customer_email || "-"}</td>
                                                <td className="px-3 py-2 text-gray-700">{g.customer_phone || "-"}</td>
                                                <td className="px-3 py-2 font-semibold text-gray-700">
                                                    {formatStatus(g.status)}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex space-x-2">
                                                        {g.status.toLowerCase() === "success" ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(g.id)}
                                                                    disabled={actionLoading === g.id}
                                                                    className="text-green-600 border border-green-500 px-2 py-1 sm:px-3 rounded hover:bg-green-50 text-xs sm:text-sm disabled:opacity-50"
                                                                >
                                                                    {actionLoading === g.id ? "Approving..." : "Approve"}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDecline(g.id)}
                                                                    disabled={actionLoading === g.id}
                                                                    className="text-red-600 border border-red-500 px-2 py-1 sm:px-3 rounded hover:bg-red-50 text-xs sm:text-sm disabled:opacity-50"
                                                                >
                                                                    {actionLoading === g.id ? "Declining..." : "Decline"}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span
                                                                className={`font-semibold ${g.status.toLowerCase() === "approved"
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                                    }`}
                                                            >
                                                                {formatStatus(g.status)}
                                                            </span>
                                                        )}
                                                    </div>
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

export default GiveawayApprovalPage;
