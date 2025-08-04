import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllCenters, getAllStates, getAllUsers, getAllCourses } from "../services/Api";

const ManagerPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStates: 0,
    totalCenters: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersResponse, statesResponse, centersResponse, coursesResponse] = await Promise.all([
          getAllUsers(1, 9999, { pagination: false }),
          getAllStates(),
          getAllCenters(),
          getAllCourses(localStorage.getItem('token'))
        ]);

        setStats({
          totalUsers: usersResponse?.data?.length || 0,
          totalStates: statesResponse?.data?.length || 0,
          totalCenters: centersResponse?.data?.length || 0,
          totalCourses: coursesResponse?.data?.length || 0
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Welcome Section with subtle animation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 transform transition-all hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Manager Dashboard</h1>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Statistics Cards with hover effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Total Users",
                    value: loading ? "..." : stats.totalUsers,
                    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                    color: "blue"
                  },
                  {
                    title: "Total States",
                    value: loading ? "..." : stats.totalStates,
                    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
                    color: "green"
                  },
                  {
                    title: "Total Centers",
                    value: loading ? "..." : stats.totalCenters,
                    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                    color: "yellow"
                  },
                  {
                    title: "Total Courses",
                    value: loading ? "..." : stats.totalCourses,
                    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                    color: "purple"
                  }
                ].map((stat, index) => (
                  <div key={index} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform transition-all hover:scale-105 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                      </div>
                      <div className={`bg-${stat.color}-50 p-3 rounded-full`}>
                        <svg className={`w-6 h-6 text-${stat.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions with enhanced buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Manage Users",
                      path: '/manage-users',
                      color: "blue",
                      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    },
                    {
                      title: "Manage States",
                      path: '/manage-states',
                      color: "green",
                      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    },
                    {
                      title: "Manage Centers",
                      path: '/manage-centers',
                      color: "yellow",
                      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    },
                    {
                      title: "Manage Courses",
                      path: '/manage-courses',
                      color: "purple",
                      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    }
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className={`flex items-center justify-between px-4 py-3 bg-${action.color}-50 text-${action.color}-700 rounded-lg hover:bg-${action.color}-100 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-${action.color}-500 focus:ring-offset-2`}
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                        </svg>
                        {action.title}
                      </span>
                      <svg className="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
