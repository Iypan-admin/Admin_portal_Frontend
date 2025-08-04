import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getCenterByAdminId, getBatchesByCenter } from '../services/Api';

function ViewBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch the center ID for the logged-in admin
        const centerResponse = await getCenterByAdminId(token);
        if (!centerResponse || !centerResponse.success) {
          throw new Error(centerResponse?.message || 'Failed to get center information');
        }

        const center = centerResponse.data?.[0];
        if (!center || !center.center_id) {
          throw new Error('No center found for this admin');
        }

        // Fetch batches for the center
        const batchesResponse = await getBatchesByCenter(center.center_id, token);
        if (!batchesResponse || !batchesResponse.success) {
          throw new Error(batchesResponse?.message || 'Failed to fetch batches data');
        }

        // Set batches directly - no need for timeout or empty state first
        setBatches(batchesResponse.data);
      } catch (error) {
        setError(error.message || 'Failed to load batches');
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  useEffect(() => {
    // Load selected center from localStorage if available
    const savedCenter = localStorage.getItem("selectedCenterView");
    if (savedCenter) {
      setSelectedCenter(JSON.parse(savedCenter));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar 
        showCenterViewOptions={!!selectedCenter} 
        selectedCenter={selectedCenter}
      />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8"> {/* Reduced padding on small screens */}
          <div className="mt-16 lg:mt-0"> {/* Extra margin for mobile navbar */}
            <div className="max-w-7xl mx-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Center Batches</h1>

              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-6 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto"> {/* Set max height with scrolling */}
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10"> {/* Make header sticky */}
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Batch Name
                            </th>
                            <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Teacher
                            </th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {batches.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-3 sm:px-6 py-8 text-center text-xs sm:text-sm text-gray-500">
                                <div className="flex flex-col items-center py-4">
                                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <p>No batches found</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            batches.map((batch) => (
                              <tr key={batch.batch_id} className="hover:bg-gray-50">
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                  {batch.batch_name}
                                </td>
                                <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[120px] md:max-w-none">
                                  {batch.course_name}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                  <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                                    batch.course_type === 'Immersion' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {batch.course_type}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                  {batch.teacher_name || 'Not Assigned'}
                                </td>
                                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                  {batch.duration} months
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

export default ViewBatchesPage;