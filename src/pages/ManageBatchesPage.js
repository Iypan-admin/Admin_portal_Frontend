import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getBatches, createBatch, updateBatch, deleteBatch } from "../services/Api";
import EditBatchModal from "../components/EditBatchModal";
import CreateBatchModal from "../components/CreateBatchModal";

const ManageBatchesPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await getBatches(token);
      console.log("Batches response:", response); // Debug log

      // Check if response has the expected structure with success and data properties
      if (response?.success && Array.isArray(response.data)) {
        setBatches(response.data);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      setError("Failed to load batches: " + error.message);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleUpdateBatch = async (batchId, updateData) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      
      console.log("Updating batch:", { batchId, updateData }); // Debug log
      
      const response = await updateBatch(token, batchId, updateData);
      
      if (response && response.success) {
        // Show success message
        alert("Batch updated successfully!");
        
        // Refresh the batches list
        await fetchBatches();
        setEditingBatch(null);
      } else {
        throw new Error(response?.message || "Failed to update batch");
      }
    } catch (error) {
      console.error("Update batch error:", error);
      setError(`Failed to update batch: ${error.message}`);
      alert("Failed to update batch. Please try again.");
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        setError(null); // Clear any existing errors
        const token = localStorage.getItem("token");

        console.log("Attempting to delete batch:", batchId); // Debug log
        console.log("Using token:", token); // Debug log

        const response = await deleteBatch(token, batchId);
        console.log("Delete response:", response); // Debug log

        // Show success message
        alert("Batch deleted successfully!");

        // Refresh the batches list after successful deletion
        await fetchBatches();
      } catch (error) {
        console.error("Delete batch error details:", {
          message: error.message,
          stack: error.stack,
          batchId: batchId,
        });

        // Set a more descriptive error message
        setError(
          `Failed to delete batch: ${error.message || "Unknown error occurred"}`
        );

        // Show error alert to user
        alert("Failed to delete batch. Please try again.");
      }
    }
  };

  const handleCreateBatch = async (batchData) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      await createBatch(token, batchData);
      await fetchBatches(); // Refresh the list
      setShowCreateModal(false);
      alert("Batch created successfully!");
    } catch (error) {
      console.error("Failed to create batch:", error);
      setError("Failed to create batch: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
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
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                  Manage Batches
                </h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
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
                  Create New Batch
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Table Container */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Batch Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell bg-gray-50">
                          Type
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell bg-gray-50">
                          Duration
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell bg-gray-50">
                          Center
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell bg-gray-50">
                          Teacher
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell bg-gray-50">
                          Course
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batches.map((batch) => (
                        <tr key={batch.batch_id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {batch.batch_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                batch.course_type === "Immersion"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {batch.course_type}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {batch.duration} months
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {batch.center_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {batch.teacher_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {batch.course_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => setEditingBatch(batch)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteBatch(batch.batch_id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingBatch && (
        <EditBatchModal
          batch={editingBatch}
          onClose={() => setEditingBatch(null)}
          onUpdate={handleUpdateBatch}
        />
      )}
      {showCreateModal && (
        <CreateBatchModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBatch}
        />
      )}
    </div>
  );
};

export default ManageBatchesPage;
