import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllCourses, createCourse, updateCourse } from '../services/Api';

const ManageCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Add this state to track submission
  const [formData, setFormData] = useState({
    course_name: '',
    program: '',
    type: '',
    language: '',
    level: '',
    mode: '',
    duration: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await getAllCourses(token);
      
      // Check if response has the expected structure
      if (response && response.success && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      await createCourse(formData, token);
      
      setShowCreateModal(false);
      setFormData({
        course_name: '',
        program: '',
        type: '',
        language: '',
        level: '',
        mode: '',
        duration: ''
      });
      
      // Refresh the courses list
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      setError('Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setFormData({
      course_name: course.course_name,
      program: course.program,
      type: course.type,
      language: course.language,
      level: course.level,
      mode: course.mode,
      duration: course.duration
    });
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      await updateCourse(editingCourse.id, formData, token);
      
      setShowCreateModal(false);
      setIsEditMode(false);
      setEditingCourse(null);
      setFormData({
        course_name: '',
        program: '',
        type: 'Regular',
        language: '',
        level: '',
        mode: '',
        duration: ''
      });
      
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      setError('Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Manage Courses</h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Course
                </button>
              </div>

              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {courses.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
                      <div className="mt-6">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          New Course
                        </button>
                      </div>
                    </div>
                  )}
                  {courses.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-20">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                              <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                              <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                              <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                              <th className="hidden xl:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                              <th className="hidden xl:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map((course) => (
                              <tr key={course.id} className="hover:bg-gray-50">
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.course_name}</td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    course.type === 'Immersion' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {course.type}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.language || '-'}</td>
                                <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.level || '-'}</td>
                                <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.duration || '-'}</td>
                                <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.mode || '-'}</td>
                                <td className="hidden xl:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.program || '-'}</td>
                                <td className="hidden xl:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(course.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleEditClick(course)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{isEditMode ? 'Edit Course' : 'Create New Course'}</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={isEditMode ? handleUpdateCourse : handleCreateCourse}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Language *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Level *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mode *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (months) *</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setIsEditMode(false);
                    setEditingCourse(null);
                    setFormData({
                      course_name: '',
                      program: '',
                      type: 'Regular',
                      language: '',
                      level: '',
                      mode: '',
                      duration: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 ${
                    submitting ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-md transition-colors`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    <>{isEditMode ? 'Update Course' : 'Create Course'}</>
                  )}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoursesPage;