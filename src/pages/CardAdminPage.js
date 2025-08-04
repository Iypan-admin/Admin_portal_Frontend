// src/pages/CardAdminPage.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { fetchCardStats, fetchRecentInactiveCards } from "../services/Api"; // ✅ import new API

const CardAdminPage = () => {
    const navigate = useNavigate();

    const [inactiveCount, setInactiveCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [recentCards, setRecentCards] = useState([]); // ✅ new state

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetchCardStats();
                setInactiveCount(res.inactive);
                setActiveCount(res.active);
                setTotalCount(res.total);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        const loadRecent = async () => {
            try {
                const data = await fetchRecentInactiveCards();
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
                    <div className="mt-20 lg:mt-0">
                        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">

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
                                    {
                                        title: "Inactive Cards",
                                        value: inactiveCount,
                                        color: "yellow",
                                        iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    },
                                    {
                                        title: "Active Cards",
                                        value: activeCount,
                                        color: "green",
                                        iconPath: "M5 13l4 4L19 7"
                                    },
                                    {
                                        title: "Total Cards",
                                        value: totalCount,
                                        color: "blue",
                                        iconPath: "M4 6h16M4 12h16M4 18h16"
                                    }
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
                                        <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                                            <svg
                                                className={`w-5 h-5 text-${stat.color}-700`}
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={stat.iconPath} />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Inactive Cards Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Pending Cards</h2>
                                        <p className="text-sm text-gray-600 mt-1">Latest unapproved card requests</p>
                                    </div>
                                    <button
                                        onClick={() => navigate("/activate-card")}
                                        className="px-3 py-2 border border-yellow-500 text-yellow-600 rounded-lg text-sm hover:bg-yellow-50"
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
                                                <th className="px-4 py-3 text-gray-500 uppercase">Card Type</th>
                                                <th className="px-4 py-3 text-gray-500 uppercase">Payment ID</th>
                                                <th className="px-4 py-3 text-gray-500 uppercase">Payment Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {recentCards.length > 0 ? (
                                                recentCards.map((card, index) => (
                                                    <tr key={card.id}>
                                                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                                                        <td className="px-4 py-3 text-gray-600">{card.card_name}</td>
                                                        <td className="px-4 py-3 text-gray-600">{card.card_no}</td>
                                                        <td className="px-4 py-3 text-gray-600">{card.card_type}</td>
                                                        <td className="px-4 py-3 text-gray-600">{card.payment_id}</td>
                                                        <td className="px-4 py-3 text-gray-600">{card.payment_date}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-4 text-gray-500 text-center">
                                                        No inactive cards found.
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
        </div>
    );

};

export default CardAdminPage;
