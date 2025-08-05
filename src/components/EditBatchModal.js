import React, { useState, useEffect } from 'react';
import { getAllCenters, getAllTeachers, getAllCourses } from '../services/Api';

const EditBatchModal = ({ batch, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    batch_name: batch.batch_name || '',
    duration: batch.duration || 6,
    center: batch.center || '',
    teacher: batch.teacher_id || '', // Make sure this matches the teacher_id from the API
    course_id: batch.course_id || '',
    time_from: batch.time_from || '',
    time_to: batch.time_to || ''
  });

  const [centers, setCenters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState({
    centers: true,
    teachers: true,
    courses: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch centers
        const centersResponse = await getAllCenters();
        if (centersResponse.success && Array.isArray(centersResponse.data)) {
          setCenters(centersResponse.data);
        }
        setLoading(prev => ({ ...prev, centers: false }));

        // Fetch teachers
        const teachersResponse = await getAllTeachers();
        if (teachersResponse.success && Array.isArray(teachersResponse.data)) {
          setTeachers(teachersResponse.data);
        }
        setLoading(prev => ({ ...prev, teachers: false }));

        // Fetch courses
        const coursesResponse = await getAllCourses();
        if (coursesResponse.success && Array.isArray(coursesResponse.data)) {
          setCourses(coursesResponse.data);
        }
        setLoading(prev => ({ ...prev, courses: false }));

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load required data');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        batch_name: formData.batch_name,
        duration: parseInt(formData.duration),
        center: formData.center,
        teacher: formData.teacher,
        course_id: formData.course_id,
        time_from: formData.time_from,
        time_to: formData.time_to
      };

      await onUpdate(batch.batch_id, updatedData);
      onClose();
    } catch (error) {
      console.error('Failed to update batch:', error);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Batch</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.batch_name}
                onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (months)</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="1"
                max="24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Center</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.center}
                onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                required
              >
                <option value="">Select Center</option>
                {centers.map((center) => (
                  <option key={center.center_id} value={center.center_id}>
                    {center.center_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Teacher</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.teacher_id} value={teacher.teacher_id}>
                    {teacher.teacher_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.time_from}
                onChange={(e) => setFormData({ ...formData, time_from: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.time_to}
                onChange={(e) => setFormData({ ...formData, time_to: e.target.value })}
                required
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading.centers || loading.teachers || loading.courses}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBatchModal;