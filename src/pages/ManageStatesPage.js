import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAllStates, editStateName } from "../services/Api";
import CreateStateModal from "../components/CreateStateModal";

const ManageStatesPage = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [newStateName, setNewStateName] = useState("");

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await getAllStates();
      setStates(response.data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
      setError("Failed to load states");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (state) => {
    setSelectedState(state);
    setNewStateName(state.state_name);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await editStateName({ stateId: selectedState.state_id, newStateName }, token);
      setShowEditModal(false);
      fetchStates();
    } catch (error) {
      console.error("Error editing state name:", error);
      setError("Failed to edit state name");
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Center Mode</h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create State
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          State Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          State Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {states.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                            No states found
                          </td>
                        </tr>
                      ) : (
                        states.map((state) => (
                          <tr key={state.state_id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {state.state_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {state.admin_name || "Not Assigned"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleEdit(state)}
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
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateStateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchStates();
            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit State Name</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New State Name</label>
                <input
                  type="text"
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
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

export default ManageStatesPage;