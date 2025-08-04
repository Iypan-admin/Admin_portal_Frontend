import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllTeachers, getAllCenters, getAllStudents } from "../services/Api";

const AcademicCoordinatorPage = () => {
  const navigate = useNavigate();
  const [teacherCount, setTeacherCount] = useState(0);
  const [centerCount, setCenterCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState({
    teachers: true,
    centers: true,
    students: true,
    pending: true
  });
  const [error, setError] = useState({
    teachers: null,
    centers: null,
    students: null,
    pending: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students and filter pending ones
        const studentsResponse = await getAllStudents();
        const students = studentsResponse.data || [];
        const pending = students.filter(student => !student.status);
        setStudentCount(students.length);
        setPendingStudents(pending.slice(0, 5)); // Show only latest 5 pending students
        setLoading(prev => ({ ...prev, students: false, pending: false }));
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setError(prev => ({ 
          ...prev, 
          students: "Failed to load student count",
          pending: "Failed to load pending approvals"
        }));
        setLoading(prev => ({ ...prev, students: false, pending: false }));
      }

      try {
        // Fetch teachers - directly use the response data
        const teachersResponse = await getAllTeachers();
        setTeacherCount(teachersResponse.data?.length || 0);
        setLoading(prev => ({ ...prev, teachers: false }));
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        setError(prev => ({ ...prev, teachers: "Failed to load teacher count" }));
        setLoading(prev => ({ ...prev, teachers: false }));
      }

      try {
        // Fetch centers
        const centersResponse = await getAllCenters();
        const centers = centersResponse.data || [];
        setCenterCount(centers.length);
        setLoading(prev => ({ ...prev, centers: false }));
      } catch (error) {
        console.error("Failed to fetch centers:", error);
        setError(prev => ({ ...prev, centers: "Failed to load center count" }));
        setLoading(prev => ({ ...prev, centers: false }));
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden"> {/* Changed min-h-screen to h-screen, added overflow-hidden */}
      <Navbar />
      <div className="flex-1 lg:ml-64 overflow-y-auto"> {/* Added overflow-y-auto */}
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Welcome Section with subtle animation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 transform transition-all hover:shadow-md">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                      Academic Coordinator Dashboard
                    </h1>
                  </div>
                </div>
              </div>

              {/* Statistics Cards with hover effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Total Teachers",
                    count: loading.teachers ? "..." : teacherCount,
                    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                    color: "blue",
                    error: error.teachers
                  },
                  {
                    title: "Active Centers",
                    count: loading.centers ? "..." : centerCount,
                    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                    color: "green",
                    error: error.centers
                  },
                  {
                    title: "Total Students",
                    count: loading.students ? "..." : studentCount,
                    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                    color: "purple",
                    error: error.students
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform transition-all hover:scale-105 hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.count}</h3>
                      </div>
                      <div className={`bg-${stat.color}-50 p-3 rounded-full`}>
                        <svg className={`w-6 h-6 text-${stat.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                    {stat.error && <p className="text-sm text-red-500 mt-2">{stat.error}</p>}
                  </div>
                ))}
              </div>

              {/* Two Column Layout with enhanced cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approvals with better table styling */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Pending Student Approvals</h2>
                      <p className="text-sm text-gray-500 mt-1">Recent student registration requests</p>
                    </div>
                    <button
                      onClick={() => navigate('/manage-students')}
                      className="inline-flex items-center px-3 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      View All
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {loading.pending ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  ) : error.pending ? (
                    <div className="text-red-500 text-sm text-center py-4">{error.pending}</div>
                  ) : pendingStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2">No pending approvals</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="max-h-60 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Center</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {pendingStudents.map((student) => (
                              <tr key={student.student_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {student.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {student.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {student.center_name}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions with enhanced buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      {
                        title: "Manage Teachers",
                        path: '/manage-teachers',
                        color: "blue",
                        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      },
                      {
                        title: "Manage Batches",
                        path: '/manage-batches',
                        color: "yellow",
                        icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      },
                      {
                        title: "Manage Students",
                        path: '/manage-students',
                        color: "purple",
                        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      }
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={() => navigate(action.path)}
                        className={`flex items-center justify-between px-4 py-3 bg-${action.color}-50 text-${action.color}-700 rounded-lg hover:bg-${action.color}-100 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-${action.color}-500 focus:ring-offset-2`}
                      >
                        <span className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                          </svg>
                          {action.title}
                        </span>
                        <svg className="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicCoordinatorPage;