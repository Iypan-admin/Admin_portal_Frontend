import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCentersForStateAdmin } from "../services/Api"; // Use the correct API

function ViewCentersPage() {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await getCentersForStateAdmin(token);

        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to fetch centers');
        }

        // Sort centers by created_at date (newest first)
        const sortedCenters = response.data.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );

        setCenters(sortedCenters);
      } catch (error) {
        console.error("Error fetching centers:", error);
        setError(error.message || "Failed to load centers");
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  const handleCenterClick = (center) => {
    if (!center.center_admin) {
      setError("This center doesn't have an admin assigned yet");
      return;
    }

    setSelectedCenter({
      center_id: center.center_id,
      center_name: center.center_name,
      // No state_name in API response, only state ID
    });

    localStorage.setItem(
      "selectedCenterView",
      JSON.stringify({
        center_id: center.center_id,
        center_name: center.center_name,
      })
    );

    try {
      navigate(`/state-admin/center/${center.center_id}/students`);
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to navigate to center view");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar
        showCenterViewOptions={!!selectedCenter}
        selectedCenter={selectedCenter}
      />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Centers Overview</h1>
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                  Total Centers: {centers.length}
                </span>
              </div>

              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-40 sm:h-64">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Center Name
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Center Admin
                            </th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Status
                            </th>
                            <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {centers.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <p className="mt-2 text-sm">No centers found</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            centers.map((center) => (
                              <tr
                                key={center.center_id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleCenterClick(center)}
                              >
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[150px] md:max-w-none">
                                  {center.center_name}
                                </td>

                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  {center.center_admin ? (
                                    <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none inline-block">
                                      {center.center_admin_name || center.center_admin}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium
                                    ${center.center_admin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {center.center_admin ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                  {formatDate(center.created_at)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCentersPage;