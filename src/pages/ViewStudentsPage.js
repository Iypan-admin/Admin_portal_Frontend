import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getStudentsByCenter, getCenterByAdminId } from '../services/Api';

function ViewStudentsPage() {
  const [students, setStudents] = useState([]);
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

  // Format phone number helper function
  const formatPhone = (phone) => {
    return phone ? phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : 'N/A';
  };

  useEffect(() => {
    const loadCenter = async () => {
      const savedCenter = localStorage.getItem("selectedCenterView");
      if (savedCenter) {
        setSelectedCenter(JSON.parse(savedCenter));
      } else {
        // Fallback: get center for current admin
        const token = localStorage.getItem("token");
        if (token) {
          const centerResponse = await getCenterByAdminId(token);
          if (centerResponse.success && Array.isArray(centerResponse.data) && centerResponse.data.length > 0) {
            const center = centerResponse.data[0];
            setSelectedCenter({
              center_id: center.center_id,
              center_name: center.center_name
            });
          }
        }
      }
    };
    loadCenter();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedCenter || !selectedCenter.center_id) {
          console.log('No center selected:', selectedCenter); // Debug log
          setStudents([]);
          setLoading(false);
          return;
        }

        console.log('Fetching students for center:', selectedCenter.center_id); // Debug log
        const token = localStorage.getItem('token');
        const response = await getStudentsByCenter(selectedCenter.center_id, token);
        
        console.log('API Response:', response); // Debug log

        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to fetch students data');
        }

        // Defensive: ensure data is always an array
        const studentsArray = Array.isArray(response.data) ? response.data : [];
        console.log('studentsArray:', studentsArray);
        setStudents(studentsArray);
      } catch (error) {
        console.error('Error in fetchStudents:', error); // Detailed error log
        setError(error.message || "Failed to load students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCenter]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar 
        showCenterViewOptions={!!selectedCenter} 
        selectedCenter={selectedCenter}
      />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8"> {/* Reduced padding on small screens */}
          <div className="mt-16 lg:mt-0"> {/* Extra margin for mobile fixed navbar */}
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Center Students</h1>
                <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {students.length} {students.length === 1 ? 'Student' : 'Students'}
                </div>
              </div>

              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="mt-2">No students found in your center</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="max-h-[calc(100vh-250px)] overflow-y-auto"> {/* Set max height with scrolling */}
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-10"> {/* Make header sticky */}
                            <tr>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reg #
                              </th>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                              </th>
                              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                              <tr key={student.student_id} className="hover:bg-gray-50">
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-none">
                                  {student.registration_number || 'N/A'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                                  {student.name}
                                </td>
                                <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[150px] md:max-w-none">
                                  {student.email}
                                </td>
                                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                  {formatPhone(student.phone)}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                                    student.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {student.status ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                  {formatDate(student.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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

export default ViewStudentsPage;