import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getTeachersByCenter, getCenterByAdminId } from '../services/Api';

function ViewTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);  // Add this state variable

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        // First get the center ID for the logged-in center admin
        const centerResponse = await getCenterByAdminId(token);
        console.log('Center Response:', centerResponse); // Debug log

        if (!centerResponse || !centerResponse.success) {
          throw new Error(centerResponse?.message || 'Failed to get center information');
        }

        // Extract the first center from the array
        const center = centerResponse.data?.[0];

        if (!center || !center.center_id) {
          throw new Error('No center found for this admin');
        }

        // Then fetch teachers for this center
        const teachersResponse = await getTeachersByCenter(center.center_id, token);
        console.log('Teachers Response:', teachersResponse); // Debug log
        console.log("Teachers Data:", teachersResponse.data);

        if (!teachersResponse || !teachersResponse.success) {
          throw new Error(teachersResponse?.message || 'Failed to fetch teachers data');
        }

        if (!Array.isArray(teachersResponse.data)) {
          throw new Error('Invalid teachers data format received');
        }

        setTeachers(teachersResponse.data);
      } catch (error) {
        console.error('Error details:', error); // More detailed error logging
        setError(error.message || 'Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Add this useEffect after your existing one
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Center Teachers</h1>
                <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {teachers.length} {teachers.length === 1 ? 'Teacher' : 'Teachers'}
                </div>
              </div>

              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  {teachers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="mt-2">No teachers found in your center</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User Name
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teachers.map((teacher) => (
                            <tr key={teacher.teacher_id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                  {teacher.teacher_full_name}

                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                  {teacher.teacher_name}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {formatDate(teacher.created_at)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewTeachersPage;