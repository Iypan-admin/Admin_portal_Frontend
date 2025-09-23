import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBatchesByCenter, getCenterById } from '../services/Api';

function ViewBatchesPage() {
  const { centerId } = useParams(); // Get centerId from URL
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Load center info for sidebar
  useEffect(() => {
    const loadCenter = async () => {
      try {
        if (location.state?.centerName) {
          setSelectedCenter({ center_id: centerId, center_name: location.state.centerName });
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const centerResponse = await getCenterById(centerId, token);
        if (!centerResponse || !centerResponse.success) {
          throw new Error(centerResponse?.message || 'Failed to fetch center info');
        }

        const center = centerResponse.data;
        setSelectedCenter({ center_id: center.center_id, center_name: center.center_name });
      } catch (err) {
        console.error('Failed to load center info:', err);
        setSelectedCenter({ center_id: centerId, center_name: 'Unknown Center' });
      }
    };

    if (centerId) loadCenter();
  }, [centerId, location.state]);

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      if (!centerId) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await getBatchesByCenter(centerId, token);

        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to fetch batches');
        }

        setBatches(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError(err.message || 'Failed to load batches');
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [centerId]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar showCenterViewOptions={!!selectedCenter} selectedCenter={selectedCenter} />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Center Batches</h1>

              {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

              {loading ? (
                <div className="flex justify-center py-6 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                            <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {batches.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-3 sm:px-6 py-8 text-center text-xs sm:text-sm text-gray-500">
                                No batches found
                              </td>
                            </tr>
                          ) : (
                            batches.map((batch) => (
                              <tr key={batch.batch_id} className="hover:bg-gray-50">
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{batch.batch_name}</td>
                                <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[120px] md:max-w-none">{batch.course_name}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                  <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${batch.course_type === 'Immersion' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>{batch.course_type}</span>
                                </td>
                                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{batch.teacher_name || 'Not Assigned'}</td>
                                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{batch.duration} months</td>
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
