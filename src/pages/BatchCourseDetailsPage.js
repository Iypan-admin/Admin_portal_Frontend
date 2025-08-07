import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBatchById, getTeacherBatchStudents } from '../services/Api';

function BatchCourseDetailsPage() {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');
        if (!batchId) throw new Error('Batch ID is required');

        setLoadingBatch(true);
        const response = await getBatchById(token, batchId);

        if (response && response.success && response.data) {
          setBatch(response.data);
        } else {
          throw new Error(response?.message || 'Failed to fetch batch details');
        }
      } catch (err) {
        console.error('Error fetching batch details:', err);
        setError(err.message || 'Failed to load batch details');
      } finally {
        setLoadingBatch(false);
      }
    };

    fetchBatchDetails();
  }, [batchId]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');
        if (!batchId) throw new Error('Batch ID is required');

        setLoadingStudents(true);
        const response = await getTeacherBatchStudents(batchId, token);

        // Update this condition to match new response structure
        if (response && response.success && Array.isArray(response.data)) {
          setStudents(response.data); // response.data already contains the formatted student data
        } else {
          throw new Error('Invalid students data format');
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setError(err.message || 'Failed to load details');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [batchId]);

  if (loadingBatch) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Navbar />
        <div className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8">
            <div className="mt-16 lg:mt-0">
              <div className="max-w-7xl mx-auto flex items-center justify-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Navbar />
        <div className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8">
            <div className="mt-16 lg:mt-0">
              <div className="max-w-7xl mx-auto p-8 bg-gray-100">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8"> {/* Reduced padding on mobile */}
          <div className="mt-16 lg:mt-0"> {/* Space for fixed navbar on mobile */}
            <div className="max-w-7xl mx-auto">
              {batch && (
                <>
                  <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{batch.batch_name}</h1>
                    <p className="text-sm text-gray-600 mt-1">Course Details</p>
                  </div>

                  {/* Course Overview */}
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6"> {/* Reduced padding on mobile */}
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Batch Name</p>
                        <p className="font-medium text-gray-800">{batch.batch_name}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Course Name</p>
                        <p className="font-medium text-gray-800">{batch.course_name || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-800">{batch.duration} months</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Center</p>
                        <p className="font-medium text-gray-800">{batch.center_name || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="font-medium text-gray-800">
                          {new Date(batch.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Students Section */}
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Students</h2>
                    {loadingStudents ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : students.length > 0 ? (
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg Number</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Center</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {students.map((student) => (
                                <tr key={student.enrollment_id} className="hover:bg-gray-50">
                                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-none">
                                      {student.registration_number}
                                    </div>
                                  </td>
                                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">{student.name}</div>
                                  </td>
                                  <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="text-xs sm:text-sm text-gray-500">{student.center_name}</div>
                                  </td>
                                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${student.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                      {student.status ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-8 text-center">
                        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No students enrolled in this batch yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchCourseDetailsPage;

