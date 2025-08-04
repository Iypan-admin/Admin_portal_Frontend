import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createNote, getNotes, deleteNote } from '../services/Api';

function BatchNotesPage() {
  const { batchId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    note: '',
    link: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchNotes = React.useCallback(async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await getNotes(batchId, token);
        console.log('Notes API Response:', response); // Debug log
        
        // Check if response.data exists and is an array
        if (response && Array.isArray(response)) {
            setNotes(response);
        } else if (response && Array.isArray(response.data)) {
            setNotes(response.data);
        } else {
            console.error('Unexpected response format:', response);
            setError('Invalid data format received');
            setNotes([]);
        }
    } catch (error) {
        console.error('Error fetching notes:', error);
        setError('Failed to load notes');
        setNotes([]);
    } finally {
        setLoading(false);
    }
}, [batchId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]); // Now fetchNotes is memoized and can be safely used as a dependency

  useEffect(() => {
    console.log('Current notes state:', notes);
}, [notes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    // Validate link format
    if (!formData.link.startsWith('https://')) {
      setSubmitError('Please enter a valid HTTPS URL');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const noteData = {
        link: formData.link,
        batch_id: batchId,
        title: formData.title,
        note: formData.note
      };

      await createNote(noteData, token);
      
      // Reset form
      setFormData({
        title: '',
        note: '',
        link: ''
      });

      // Show success message (optional)
      alert('Note posted successfully!');

      // Refresh notes list
      fetchNotes();
    } catch (error) {
      setSubmitError(error.message || 'Failed to post note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
        try {
            const token = localStorage.getItem('token');
            await deleteNote(noteId, token); // Pass the note_id to the delete API
            
            // Refresh the notes list after deletion
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            setError('Failed to delete note: ' + error.message);
        }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
                <h1 className="text-2xl font-bold text-gray-800">Course Notes</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Post Notes Container */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Post New Note</h2>
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
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter note title"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resource Link
                          </label>
                          <input
                            type="url"
                            name="link"
                            value={formData.link}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Add description or instructions"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
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
                      {submitting ? 'Posting...' : 'Post Note'}
                    </button>
                  </form>
                </div>

                {/* Uploaded Notes Container */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Posted Notes</h2>
                  <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : error ? (
                      <div className="text-red-500 text-center py-4">{error}</div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg 
                          className="w-12 h-12 mx-auto text-gray-400 mb-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        <p>No notes posted yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notes.map((note) => (
                          <div key={note.notes_id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {note.title || 'Untitled Note'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Posted on {formatDate(note.created_at)}
                                </p>
                                {note.note && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    {note.note}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <a
                                  href={note.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                                >
                                  View Resource
                                </a>
                                <button 
                                  onClick={() => handleDeleteNote(note.notes_id)}
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
  );
}

export default BatchNotesPage;