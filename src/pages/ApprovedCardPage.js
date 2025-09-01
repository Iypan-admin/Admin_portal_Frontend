import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getPendingElitePayments,
    approveElitePayment,
    declineElitePayment,
} from "../services/Api";

const ApprovedCardPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Search & filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all | success | approved | declined

    const loadPendingPayments = async () => {
        try {
            setLoading(true);
            const data = await getPendingElitePayments();
            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading payments:", error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this payment?")) return;
        try {
            setActionLoading(id);
            await approveElitePayment(id);
            alert("✅ Payment approved successfully!");
            await loadPendingPayments();
        } catch (err) {
            console.error("Approval failed:", err);
            alert("❌ Failed to approve payment. Try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (id) => {
        if (!window.confirm("Are you sure you want to decline this payment?")) return;
        try {
            setActionLoading(id);
            await declineElitePayment(id);
            alert("🚫 Payment declined successfully!");
            await loadPendingPayments();
        } catch (err) {
            console.error("Decline failed:", err);
            alert("❌ Failed to decline payment. Try again.");
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        loadPendingPayments();
    }, []);

    // Filter & search logic
    const filteredPayments = payments.filter((pay) => {
        const matchesSearch =
            pay.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.bank_rrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.card_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === "all" ? true : pay.status.toLowerCase() === filterStatus;

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
                                Pending Elite Payments
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Elite card payments awaiting finance approval
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by Name, Payment ID, Bank RRN, Card"
                                className="px-3 py-2 border rounded-md text-sm w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="px-3 py-2 border rounded-md text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="success">Success</option>
                                <option value="approved">Approved</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : filteredPayments.length === 0 ? (
                        <p className="text-gray-500">No payments match your search/filter.</p>
                    ) : (
                        <div className="overflow-x-auto border rounded-lg bg-white shadow-md">
                            <div className="max-h-[420px] overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Full Name</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Payment Date</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Payment ID</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Bank RRN</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Card Name</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPayments.map((pay) => (
                                            <tr key={pay.id}>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">{pay.full_name}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">
                                                    {pay.payment_date
                                                        ? new Date(pay.payment_date).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">{pay.payment_id}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">{pay.bank_rrn}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700">{pay.card_name}</td>
                                                <td className="px-3 py-2 sm:px-4 text-gray-700 font-semibold">
                                                    {pay.status}
                                                </td>
                                                <td className="px-3 py-2 sm:px-4">
                                                    <div className="flex space-x-2">
                                                        {pay.status.toLowerCase() === "success" ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(pay.id)}
                                                                    disabled={actionLoading === pay.id}
                                                                    className="text-green-600 border border-green-500 px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-green-50 text-xs sm:text-sm disabled:opacity-50"
                                                                >
                                                                    {actionLoading === pay.id ? "Approving..." : "Approve"}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDecline(pay.id)}
                                                                    disabled={actionLoading === pay.id}
                                                                    className="text-red-600 border border-red-500 px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-red-50 text-xs sm:text-sm disabled:opacity-50"
                                                                >
                                                                    {actionLoading === pay.id ? "Declining..." : "Decline"}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span
                                                                className={`font-semibold ${pay.status.toLowerCase() === "approved"
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                                    }`}
                                                            >
                                                                {pay.status.charAt(0).toUpperCase() + pay.status.slice(1)}
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

export default ApprovedCardPage;
