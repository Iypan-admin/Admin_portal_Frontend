import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllStates, getAllCenters } from "../services/Api";

const AdminPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStates: 0,
    totalCenters: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersResponse, statesResponse, centersResponse] = await Promise.all([
          getAllUsers({ pagination: false }),
          getAllStates(),
          getAllCenters()
        ]);

        setStats({
          totalUsers: usersResponse?.data?.length || 0,
          totalStates: statesResponse?.data?.length || 0,
          totalCenters: centersResponse?.data?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminCards = [
    {
      title: "Manage Users",
      description: "Add, edit, and remove system users",
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: "/manage-users",
      color: "blue",
      bgColor: "bg-blue-50"
    },
    {
      title: "Manage States",
      description: "View and manage state locations",
      icon: (
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: "/manage-states",
      color: "green",
      bgColor: "bg-green-50"
    },
    {
      title: "Manage Centers",
      description: "View and manage learning centers",
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: "/manage-centers",
      color: "purple",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                      Admin Dashboard
                    </h1>
                  </div>
                </div>
              </div>

              {/* Statistics Section */}
              {error ? (
                <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">
                          {loading ? "..." : stats.totalUsers}
                        </h3>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-full">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Total States</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">
                          {loading ? "..." : stats.totalStates}
                        </h3>
                      </div>
                      <div className="bg-green-50 p-3 rounded-full">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Total Centers</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">
                          {loading ? "..." : stats.totalCenters}
                        </h3>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-full">
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCards.map((card) => (
                  <button
                    key={card.title}
                    onClick={() => navigate(card.path)}
                    className={`${card.bgColor} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left group relative overflow-hidden`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-4 transition-transform group-hover:scale-110 duration-300">
                            {card.icon}
                          </div>
                          <h3 className={`text-xl font-semibold mb-2 text-gray-900 group-hover:text-${card.color}-600 transition-colors duration-300`}>
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {card.description}
                          </p>
                        </div>
                        <span className={`text-${card.color}-500 text-xl group-hover:transform group-hover:translate-x-1 transition-all duration-300`}>
                          →
                        </span>
                      </div>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br from-${card.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;