import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getBatchesByCenter, getStudentsByCenter, getCenterByAdminId, getTeachersByCenter } from "../services/Api";

function CenterAdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBatches: 0,
    activeStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const centerResponse = await getCenterByAdminId(token);
        console.log("Center Response:", centerResponse);

        if (!centerResponse || !centerResponse.success) {
          throw new Error(centerResponse?.message || 'Failed to get center information');
        }

        // Access the first element in the data array, matching ViewBatchesPage.js structure
        const center = centerResponse.data?.[0];
        if (!center || !center.center_id) {
          throw new Error('No center found for this admin');
        }

        // Set the selected center for navbar links
        if (center && center.center_id) {
          setSelectedCenter({
            center_id: center.center_id,
            center_name: center.center_name || "Current Center"
          });
        }

        // Now use center.center_id instead of centerId
        try {
          const [studentsResponse, teachersResponse, batchesResponse] = await Promise.all([
            getStudentsByCenter(center.center_id, token),
            getTeachersByCenter(center.center_id, token),
            getBatchesByCenter(center.center_id, token)
          ]);

          // Debug logs
          console.log("Students Response:", studentsResponse);
          console.log("Teachers Response:", teachersResponse);
          console.log("Batches Response:", batchesResponse);

          // More lenient validation
          const validateResponse = (response) => {
            if (!response) {
              console.error("Empty response received");
              return [];
            }
            if (!response.success) {
              console.warn("Response indicates failure:", response);
              return [];
            }
            if (!Array.isArray(response.data)) {
              console.warn("Response data is not an array:", response.data);
              return [];
            }
            return response.data;
          };

          const students = validateResponse(studentsResponse);
          const teachers = validateResponse(teachersResponse);
          const batches = validateResponse(batchesResponse);

          setStats({
            totalStudents: students.length,
            activeStudents: students.filter(student => student.status === true).length,
            totalTeachers: teachers.length,
            totalBatches: batches.length
          });

        } catch (apiError) {
          console.error("API Error Details:", {
            error: apiError,
            message: apiError.message,
            studentsUrl: `${process.env.LIST_API_URL}/students/center/${center.center_id}`,
            teachersUrl: `${process.env.LIST_API_URL}/center/${center.center_id}/teachers`,
            batchesUrl: `${process.env.LIST_API_URL}/batchcenter/${center.center_id}`,
          });
          throw new Error(`Failed to fetch data: ${apiError.message}`);
        }

      } catch (error) {
        console.error("Error fetching stats:", error);
        setError(error.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Navbar
        showCenterViewOptions={!!selectedCenter}
        selectedCenter={selectedCenter}
      />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Welcome Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 transform transition-all hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                      Dashboard : {selectedCenter ? selectedCenter.center_name : ""}
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

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Total Students",
                    value: loading ? "..." : stats.totalStudents,
                    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                    color: "blue"
                  },
                  {
                    title: "Active Students",
                    value: loading ? "..." : stats.activeStudents,
                    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                    color: "green"
                  },
                  {
                    title: "Total Teachers",
                    value: loading ? "..." : stats.totalTeachers,
                    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                    color: "yellow"
                  },
                  {
                    title: "Total Batches",
                    value: loading ? "..." : stats.totalBatches,
                    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                    color: "purple"
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-xl shadow-sm border border-${stat.color}-200 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-${stat.color}-600 text-sm font-medium`}>{stat.title}</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                      </div>
                      <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                        <svg className={`w-6 h-6 text-${stat.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "View Students",
                      path: "/center-admin/students",
                      color: "blue",
                      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    },
                    {
                      title: "View Teachers",
                      path: "/center-admin/teachers",
                      color: "yellow",
                      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    },
                    {
                      title: "View Batches",
                      path: "/center-admin/batches",
                      color: "purple",
                      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    }
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className={`flex items-center justify-center gap-3 px-4 py-3 bg-${action.color}-50 text-${action.color}-700 rounded-lg hover:bg-${action.color}-100 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-${action.color}-500 focus:ring-offset-2`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                      </svg>
                      <span>{action.title}</span>
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
}

export default CenterAdminPage;

