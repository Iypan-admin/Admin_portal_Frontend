import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createGMeet, getGMeetsByBatch, deleteGMeet } from '../services/Api';

function TakeClassPage() {
  const { batchId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState({ today: [], future: [] });
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    title: '',
    note: '',
    meet_link: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateGMeetLink = (link) => {
    const gmeetPattern = /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i;
    return gmeetPattern.test(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    if (!validateGMeetLink(formData.meet_link)) {
      setSubmitError('Please enter a valid Google Meet link');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const gmeetData = {
        batch_id: batchId,
        meet_link: formData.meet_link,
        date: formData.date,
        time: formData.time,
        current: true,
        note: formData.note,
        title: formData.title
      };

      await createGMeet(gmeetData, token);
      
      setFormData({
        date: '',
        time: '',
        duration: '60',
        title: '',
        note: '',
        meet_link: ''
      });

      fetchUpcomingClasses();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUpcomingClasses = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getGMeetsByBatch(batchId, token);

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];

      const todayClasses = response.filter(classItem => classItem.date === currentDate)
        .sort((a, b) => new Date(a.time) - new Date(b.time));

      const futureClasses = response.filter(classItem => classItem.date > currentDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setUpcomingClasses({ today: todayClasses, future: futureClasses });
      setError(null);
    } catch (error) {
      console.error('Error fetching upcoming classes:', error);
      setError('Failed to load upcoming classes');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchUpcomingClasses();
  }, [fetchUpcomingClasses]);

  const handleDeleteClass = async (meetId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        const token = localStorage.getItem('token');
        await deleteGMeet(meetId, token);
        
        // After successful deletion, refresh the class list
        fetchUpcomingClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        setError('Failed to delete class: ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Take Class</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Schedule a Class</h2>
                  {submitError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                      {submitError}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter class title"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Google Meet Link
                          </label>
                          <input
                            type="url"
                            name="meet_link"
                            value={formData.meet_link}
                            onChange={handleInputChange}
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                            pattern="https://meet\.google\.com/[a-z0-9-]+"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Format: https://meet.google.com/xxx-xxxx-xxx
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note
                          </label>
                          <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Add class description or notes"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-2 px-4 rounded-md transition-colors ${
                        submitting 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {submitting ? 'Scheduling...' : 'Schedule Class'}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
{}                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Classes</h2>
                      <div className="space-y-4">
                        {loading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        ) : error ? (
                          <div className="text-red-500 text-center py-4">{error}</div>
                        ) : upcomingClasses.today?.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <p>No classes scheduled for today</p>
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto pr-2 divide-y divide-gray-200">
                            {upcomingClasses.today?.map((classItem) => (
                              <div key={classItem.meet_id} className="py-4 first:pt-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                                    <p className="text-sm text-gray-500">{formatTime(classItem.time)}</p>
                                    {classItem.note && (
                                      <p className="text-sm text-gray-600 mt-2 italic">{classItem.note}</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => window.open(classItem.meet_link, '_blank')}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                                    >
                                      Join Meet
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteClass(classItem.meet_id)}
                                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Classes</h2>
                      <div className="space-y-4">
                        {loading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        ) : error ? (
                          <div className="text-red-500 text-center py-4">{error}</div>
                        ) : upcomingClasses.future?.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <p>No upcoming classes scheduled</p>
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto pr-2 divide-y divide-gray-200">
                            {upcomingClasses.future?.map((classItem) => (
                              <div key={classItem.meet_id} className="py-4 first:pt-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{formatDate(classItem.date)}</p>
                                    <p className="text-sm text-gray-500">{formatTime(classItem.time)}</p>
                                    {classItem.note && (
                                      <p className="text-sm text-gray-600 mt-2 italic">{classItem.note}</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => window.open(classItem.meet_link, '_blank')}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                                    >
                                      Join Meet
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteClass(classItem.meet_id)}
                                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeClassPage;