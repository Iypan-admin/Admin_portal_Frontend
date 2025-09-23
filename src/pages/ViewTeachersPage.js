import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getTeachersByCenter, getCenterById } from '../services/Api';

function ViewTeachersPage() {
  const { centerId } = useParams();
  const location = useLocation();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

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

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!centerId) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await getTeachersByCenter(centerId, token);

        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to fetch teachers data');
        }

        setTeachers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError(err.message || 'Failed to load teachers');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [centerId]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar showCenterViewOptions={!!selectedCenter} selectedCenter={selectedCenter} />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Center Teachers</h1>
                <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {teachers.length} {teachers.length === 1 ? 'Teacher' : 'Teachers'}
                </div>
              </div>

              {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  {teachers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No teachers found in this center</p>
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
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                {teacher.teacher_full_name}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                {teacher.teacher_name}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {formatDate(teacher.created_at)}
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
