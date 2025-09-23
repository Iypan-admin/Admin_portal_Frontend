import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAllStudents, approveStudent } from "../services/Api";

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPhone = (phone) => {
    return phone
      ? phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
      : "N/A";
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

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students
    .filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
    .sort((a, b) => {
      return a.status === b.status ? 0 : a.status ? 1 : -1;
    });

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
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      <Navbar />
      <div className="flex-1 lg:ml-64 overflow-hidden">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Manage Students
              </h1>

              {/* Search bar */}
              <div className="mb-6 w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md">
                {/* Horizontal scroll for mobile */}
                <div className="overflow-x-auto w-full">
                  {/* Vertical scroll for long lists */}
                  <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                    <table className="w-full min-w-[700px] divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg Number</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student.student_id} className="hover:bg-gray-50">
                            <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{student.registration_number}</td>
                            <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">{student.name}</td>
                            <td className="px-3 py-4 text-sm text-gray-500 truncate max-w-[150px]">{student.email}</td>
                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{formatPhone(student.phone)}</td>
                            <td className="px-3 py-4 text-sm text-gray-500 truncate max-w-[120px]">{student.batch_name}</td>
                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{student.center_name}</td>
                            <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(student.created_at)}</td>
                            <td className="px-3 py-4 text-sm whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {student.status ? "Active" : "Pending"}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm font-medium whitespace-nowrap">
                              {!student.status && (
                                <button onClick={() => handleApprove(student.student_id)} className="text-green-600 hover:text-green-900">
                                  Approve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>



              {/* Empty State */}
              {filteredStudents.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No students found in the system.
                  </p>
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
