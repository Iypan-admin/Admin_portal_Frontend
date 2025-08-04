import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createChatMessage, fetchChatMessages, deleteChatMessage, updateChatMessage } from '../services/Api';

function BatchChatsPage() {
  const { batchId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch messages when component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await fetchChatMessages(batchId);
        setMessages(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load chat messages');
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      loadMessages();
    }
  }, [batchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const chatData = {
        text: message.trim(),
        batch_id: batchId,
        sender: 'teacher'
      };

      const response = await createChatMessage(chatData);
      
      // Clear input first
      setMessage('');
      
      // Add the new message to the messages array immediately
      if (response && response.success && response.data) {
        setMessages(prevMessages => [...prevMessages, response.data]);
      }
      
      // Then fetch all messages to ensure synchronization
      const updatedMessages = await fetchChatMessages(batchId);
      setMessages(updatedMessages);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await deleteChatMessage(messageId);

      // Check for the 'message' property instead of 'success'
      if (response && response.message) {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      } else {
        throw new Error(response.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  const handleEditClick = (msg) => {
    setEditingMessage(msg.id);
    setEditText(msg.text);
  };

  const handleEditSubmit = async (messageId) => {
    if (!editText.trim()) return;
    
    try {
      const updateData = {
        text: editText.trim(),
        batch_id: batchId
      };
      
      await updateChatMessage(messageId, updateData);
      
      // Update local messages state
      setMessages(messages.map(msg => 
        msg.id === messageId ? {...msg, text: editText.trim()} : msg
      ));
      
      // Exit edit mode
      setEditingMessage(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating message:', err);
      alert('Failed to update message');
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Batch Chat</h1>
                {error && (
                  <div className="mt-2 text-red-600 text-sm">{error}</div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm flex flex-col h-[calc(100vh-12rem)]">
                {/* Chat Messages Area */}
                <div className="flex-grow p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 relative ${
                          msg.sender === 'teacher' 
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {editingMessage === msg.id ? (
                            <div className="flex flex-col space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-gray-800 focus:ring-2 focus:ring-blue-500"
                                rows="3"
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingMessage(null)}
                                  className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleEditSubmit(msg.id)}
                                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{msg.text}</p>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {new Date(msg.created_at || msg.timestamp).toLocaleTimeString()}
                              </span>
                              
                              {/* Simple action buttons for teacher's messages */}
                              {!editingMessage && (
                                <div className="flex mt-2 justify-end space-x-2">
                                  <button
                                    onClick={() => handleEditClick(msg)}
                                    className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className={`px-4 py-2 rounded-lg ${
                        message.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      } transition-colors`}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchChatsPage;