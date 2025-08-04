import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllTransactions } from "../services/Api";

const FinanceAdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    approvedTransactions: 0,
    recentPendingTransactions: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getAllTransactions();

        // Calculate stats based on transactions
        const transactions = Array.isArray(response) ? response : response.data || [];
        const pendingTransactions = transactions.filter(t => !t.status);
        const approvedTransactions = transactions.filter(t => t.status);

        // Sort transactions by date (newest first) and get the 5 most recent pending ones
        const recentPending = [...pendingTransactions]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setStats({
          totalTransactions: transactions.length,
          pendingTransactions: pendingTransactions.length,
          approvedTransactions: approvedTransactions.length,
          recentPendingTransactions: recentPending
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to load transaction statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8"> {/* Reduced padding on small screens */}
          <div className="mt-16 lg:mt-0"> {/* Extra margin top on mobile for navbar */}
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8"> {/* Reduced spacing on mobile */}
              {/* Welcome Section with subtle animation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 transform transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-4 sm:gap-0">
                  <div className="p-3 bg-blue-50 rounded-full self-start">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800">
                      Finance Admin Dashboard
                    </h1>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Statistics Cards with animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    title: "Pending Transactions",
                    value: loading ? "..." : stats.pendingTransactions,
                    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                    color: "yellow",
                    bgColor: "bg-yellow-50"
                  },
                  {
                    title: "Approved Transactions",
                    value: loading ? "..." : stats.approvedTransactions,
                    icon: "M5 13l4 4L19 7",
                    color: "green",
                    bgColor: "bg-green-50"
                  },
                  {
                    title: "Total Transactions",
                    value: loading ? "..." : stats.totalTransactions,
                    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                    color: "blue",
                    bgColor: "bg-blue-50"
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bgColor} rounded-xl shadow-sm border border-${stat.color}-200 p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:scale-105`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-${stat.color}-700 text-sm font-medium`}>{stat.title}</p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                      </div>
                      <div className={`bg-${stat.color}-100 p-2 sm:p-3 rounded-full`}>
                        <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Transactions Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Pending Transactions</h2>
                    <p className="text-sm text-gray-600 mt-1">Latest unapproved payment requests</p>
                  </div>
                  <button
                    onClick={() => navigate('/approve-students')}
                    className="inline-flex items-center px-3 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium self-start sm:self-center"
                  >
                    View All
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : stats.recentPendingTransactions.length === 0 ? (
                  <div className="text-center py-4 sm:py-7">
                    <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">All transactions have been processed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.recentPendingTransactions.map(transaction => (
                          <tr key={transaction.payment_id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {transaction.transaction_id}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">
                              {transaction.student_email}
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.course_name || "N/A"}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceAdminPage;