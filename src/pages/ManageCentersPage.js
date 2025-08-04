import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAllCenters, editCenterName } from "../services/Api";
import CreateCenterModal from "../components/CreateCenterModal";

const ManageCentersPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [newCenterName, setNewCenterName] = useState("");

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await getAllCenters();
      if (response.success && Array.isArray(response.data)) {
        setCenters(response.data);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      setError("Failed to load centers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (center) => {
    setSelectedCenter(center);
    setNewCenterName(center.center_name);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await editCenterName({ centerId: selectedCenter.center_id, newCenterName }, token);
      setShowEditModal(false);
      fetchCenters();
    } catch (error) {
      console.error("Error editing center name:", error);
      setError("Failed to edit center name");
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Centers</h1>
                    <p className="mt-2 text-gray-600">View and manage centers in your organization</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                             transition duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Center
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Center Name
                            </th>
                            <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              State
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Center Admin
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {centers.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-3 sm:px-6 py-4 text-center text-sm text-gray-500">
                                <div className="flex flex-col items-center py-6">
                                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <p className="mt-2">No centers found</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            centers.map((center) => (
                              <tr key={center.center_id} className="hover:bg-gray-50">
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
                                  {center.center_name}
                                </td>
                                <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {center.state?.state_name || 'Not Assigned'}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {center.center_admin?.name || 'Not Assigned'}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <button
                                    onClick={() => handleEdit(center)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Edit
                                  </button>
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <CreateCenterModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              fetchCenters();
              setShowCreateModal(false);
            }}
          />
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Center Name</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Center Name</label>
                <input
                  type="text"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCentersPage;