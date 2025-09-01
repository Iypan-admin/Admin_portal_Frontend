// src/pages/CardAdminPage.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getCardStats, getRecentPendingCards } from "../services/Api";

const CardAdminPage = () => {
    const navigate = useNavigate();

    const [pendingCount, setPendingCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [recentCards, setRecentCards] = useState([]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await getCardStats();
                setPendingCount(res.pending || 0);
                setActiveCount(res.active || 0);
                setTotalCount(res.total || 0);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        const loadRecent = async () => {
            try {
                const data = await getRecentPendingCards();
                setRecentCards(data);
            } catch (err) {
                console.error("Failed to fetch recent cards:", err);
            }
        };

        loadStats();
        loadRecent();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col lg:flex-row">
            <Navbar />
            <div className="flex-1 lg:ml-64">
                <div className="p-2 sm:p-4 lg:p-8">
                    <div className="mt-20 lg:mt-0 max-w-7xl mx-auto space-y-4 sm:space-y-8">

                        {/* Welcome Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-full self-start sm:self-center">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800">
                                        Card Admin Dashboard
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {[
                                { title: "Active Cards", value: activeCount, color: "green" },
                                { title: "Pending Cards", value: pendingCount, color: "red" },
                                { title: "Total Cards", value: totalCount, color: "blue" }
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-${stat.color}-50 rounded-xl border border-${stat.color}-200 p-6 flex justify-between items-center hover:shadow-md transition-transform hover:scale-105`}
                                >
                                    <div>
                                        <p className={`text-${stat.color}-700 text-sm font-medium`}>
                                            {stat.title}
                                        </p>
                                        <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Pending Cards Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Pending Cards</h2>
                                    <p className="text-sm text-gray-600 mt-1">Latest pending card requests</p>
                                </div>
                                <button
                                    onClick={() => navigate("/elite-card-payments")}
                                    className="px-3 py-2 border border-red-500 text-red-600 rounded-lg text-sm hover:bg-red-50"
                                >
                                    View All
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 text-gray-500 uppercase">S.No</th>
                                            <th className="px-4 py-3 text-gray-500 uppercase">Card Name</th>
                                            <th className="px-4 py-3 text-gray-500 uppercase">Card Number</th>
                                            {/* <th className="px-4 py-3 text-gray-500 uppercase">Name</th> */}
                                            <th className="px-4 py-3 text-gray-500 uppercase">Email</th>
                                            <th className="px-4 py-3 text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {recentCards.length > 0 ? (
                                            recentCards.map((card, index) => (
                                                <tr key={card.id}>
                                                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                                                    <td className="px-4 py-3 text-gray-600">{card.card_name}</td>
                                                    <td className="px-4 py-3 text-gray-600">{card.card_number}</td>
                                                    {/* <td className="px-4 py-3 text-gray-600">{card.name_on_the_pass}</td> */}
                                                    <td className="px-4 py-3 text-gray-600">{card.email}</td>
                                                    <td className="px-4 py-3 text-gray-600">{card.status}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-4 text-gray-500 text-center">
                                                    No pending cards found.
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
        </div>
    );
};

export default CardAdminPage;
