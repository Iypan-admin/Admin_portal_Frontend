import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAllStudents, approveStudent } from "../services/Api";

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format phone number helper function
  const formatPhone = (phone) => {
    return phone ? phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : 'N/A';
  };

  const handleApprove = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      await approveStudent(token, studentId);
      const response = await getAllStudents();
      if (response && response.data) {
        setStudents(response.data);
      }
      alert("Student approved successfully!");
    } catch (error) {
      console.error("Error approving student:", error);
      alert("Failed to approve student: " + error.message);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllStudents();
        if (response && response.data) {
          setStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Navbar />
        <div className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8 flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8"> {/* Reduced padding on small screens */}
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Manage Students</h1>
                {/* Optional button code remains the same */}
              </div>

              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Table Container */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Reg Number</th>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                          <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Email</th>
                          <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Phone</th>
                          <th className="hidden lg:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Center</th>
                          <th className="hidden lg:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Created</th>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.student_id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                              {student.registration_number}
                            </td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                              {student.name}
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px] md:max-w-none">
                              {student.email}
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatPhone(student.phone)}
                            </td>
                            <td className="hidden lg:table-cell px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.center_name}
                            </td>
                            <td className="hidden lg:table-cell px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(student.created_at)}
                            </td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                student.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {student.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                {!student.status && (
                                  <button
                                    onClick={() => handleApprove(student.student_id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {students.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
                  <p className="mt-1 text-sm text-gray-500">No students found in the system.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStudentsPage;