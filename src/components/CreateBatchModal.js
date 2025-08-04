import React, { useState, useEffect } from 'react';
import { getAllCenters, getAllTeachers, getAllCourses } from '../services/Api';

const CreateBatchModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    batch_name: '',
    duration: 6,
    center: '',
    teacher: '',
    course_id: ''
  });

  const [centers, setCenters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState({
    centers: true,
    teachers: true,
    courses: true
  });
  const [error, setError] = useState({
    centers: null,
    teachers: null,
    courses: null
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch centers
      try {
        setLoading(prev => ({ ...prev, centers: true }));
        const centersResponse = await getAllCenters();
        if (centersResponse && centersResponse.success && Array.isArray(centersResponse.data)) {
          setCenters(centersResponse.data);
        } else {
          setError(prev => ({ ...prev, centers: 'Invalid centers data format' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, centers: 'Failed to load centers' }));
        console.error('Error fetching centers:', err);
      } finally {
        setLoading(prev => ({ ...prev, centers: false }));
      }

      // Updated teachers fetch
      try {
        setLoading(prev => ({ ...prev, teachers: true }));
        const response = await getAllTeachers();

        if (response.success && Array.isArray(response.data)) {
          setTeachers(response.data);
        } else {
          setError(prev => ({ ...prev, teachers: 'Invalid teachers data format' }));
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError(prev => ({ ...prev, teachers: 'Failed to load teachers' }));
      } finally {
        setLoading(prev => ({ ...prev, teachers: false }));
      }

      // Fetch courses
      try {
        setLoading(prev => ({ ...prev, courses: true }));
        const token = localStorage.getItem("token");
        const coursesResponse = await getAllCourses(token);

        if (coursesResponse && Array.isArray(coursesResponse.data)) {
          setCourses(coursesResponse.data);
        } else {
          setError(prev => ({ ...prev, courses: 'Invalid courses data format' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, courses: 'Failed to load courses' }));
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(prev => ({ ...prev, courses: false }));
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const selectedCourse = courses.find((c) => c.id === formData.course_id);
    if (selectedCourse) {
      setFormData((prev) => ({
        ...prev,
        duration: selectedCourse.duration || 0
      }));
    }
  }, [formData.course_id, courses]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const batchData = {
        batch_name: formData.batch_name,
        duration: parseInt(formData.duration),
        center: formData.center,
        teacher: formData.teacher,
        course_id: formData.course_id
      };

      await onSubmit(batchData);
      onClose();
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Create New Batch</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  placeholder="20XXISMLXX"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.batch_name}
                  onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                  required
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                {loading.courses ? (
                  <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="animate-pulse flex space-x-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ) : error.courses ? (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error.courses}</div>
                ) : (
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} - {course.type}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                <input
                  type="number"
                  value={formData.duration}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                />
              </div>


              {/* Center Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
                {loading.centers ? (
                  <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="animate-pulse flex space-x-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ) : error.centers ? (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error.centers}</div>
                ) : (
                  <div className="space-y-1">
                    <select
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={formData.center}
                      onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                      required
                    >
                      <option value="">Select a center</option>
                      {centers.map((center) => (
                        <option key={center.center_id} value={center.center_id}>
                          {center.center_name}
                        </option>
                      ))}
                    </select>
                    {formData.center && centers.find(c => c.center_id === formData.center)?.center_admin?.name && (
                      <p className="text-sm text-gray-500 mt-1">
                        Center Admin: {centers.find(c => c.center_id === formData.center).center_admin.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                {loading.teachers ? (
                  <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="animate-pulse flex space-x-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ) : error.teachers ? (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error.teachers}</div>
                ) : (
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.teacher_id} value={teacher.teacher_id}>
                        {teacher.teacher_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Create Batch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBatchModal;