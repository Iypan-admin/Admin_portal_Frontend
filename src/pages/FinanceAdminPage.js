import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllPayments } from "../services/Api"; // <-- updated

const FinanceAdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    recentPendingPayments: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getAllPayments();

        if (!response.success) throw new Error(response.error || "Failed to fetch");

        const payments = Array.isArray(response.data) ? response.data : [];
        const pendingPayments = payments.filter(p => !p.status);
        const approvedPayments = payments.filter(p => p.status);

        const recentPending = [...pendingPayments]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setStats({
          totalPayments: payments.length,
          pendingPayments: pendingPayments.length,
          approvedPayments: approvedPayments.length,
          recentPendingPayments: recentPending
        });
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load payment statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Pending Payments",
      value: loading ? "..." : stats.pendingPayments,
      color: "yellow",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      title: "Approved Payments",
      value: loading ? "..." : stats.approvedPayments,
      color: "green",
      icon: "M5 13l4 4L19 7"
    },
    {
      title: "Total Payments",
      value: loading ? "..." : stats.totalPayments,
      color: "blue",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case "yellow":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", iconBg: "bg-yellow-100", icon: "text-yellow-500" };
      case "green":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", iconBg: "bg-green-100", icon: "text-green-500" };
      case "blue":
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconBg: "bg-blue-100", icon: "text-blue-500" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", iconBg: "bg-gray-100", icon: "text-gray-500" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0 max-w-7xl mx-auto space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 transform transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800">Finance Admin Dashboard</h1>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center space-x-3">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, idx) => {
            const c = getColorClasses(stat.color);
            return (
              <div key={idx} className={`${c.bg} rounded-xl shadow-sm border ${c.border} p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:scale-105`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${c.text} text-sm font-medium`}>{stat.title}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                  </div>
                  <div className={`${c.iconBg} p-2 sm:p-3 rounded-full`}>
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${c.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Pending Payments</h2>
              <p className="text-sm text-gray-600 mt-1">Latest unapproved payment requests</p>
            </div>
            <button
              onClick={() => navigate('/approve-students')}
              className="inline-flex items-center px-3 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium self-start sm:self-center"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : stats.recentPendingPayments.length === 0 ? (
            <div className="text-center py-4 sm:py-7">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending payments</h3>
              <p className="mt-1 text-sm text-gray-500">All payments are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentPendingPayments.map(t => (
                    <tr key={t.payment_id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">{t.payment_id}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">{t.student_email}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">{t.course_name || "N/A"}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceAdminPage;
