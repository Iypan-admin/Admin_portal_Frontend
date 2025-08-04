import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import Navbar from '../components/Navbar';
import { getTeacherBatches } from '../services/Api';

function TeacherClassesPage() {
  const navigate = useNavigate(); // Add this
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await getTeacherBatches(token);
        setBatches(response.data || []);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setError('Failed to load your classes');
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Modify the handleBatchClick function
  const handleBatchClick = (batchId) => {
    // Navigate directly to take-class page instead of batch details
    navigate(`/teacher/batch/${batchId}/take-class`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64"> {/* Add margin equal to sidebar width */}
        <div className="p-4 lg:p-8">
          {/* Add padding to account for mobile menu button */}
          <div className="mt-16 lg:mt-0"> {/* Add top margin on mobile only */}
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Your Classes</h1>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {batches.map((batch) => (
                    <div 
                      key={batch.batch_id} 
                      onClick={() => handleBatchClick(batch.batch_id)}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer"
                    >
                      {/* Card Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            {batch.batch_name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {batch.center_name}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Course Name</p>
                            <p className="font-medium text-gray-800">{batch.course_name}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Course Type</p>
                            <p className="font-medium text-gray-800">{batch.course_type}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              batch.type === 'Online' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {batch.type === 'Online' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                )}
                              </svg>
                              {batch.type}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Created {formatDate(batch.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!loading && batches.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 text-lg">No classes found</p>
                    <p className="text-gray-400 text-sm mt-2">You haven't been assigned to any classes yet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherClassesPage;