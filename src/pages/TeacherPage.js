import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function TeacherPage() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Your Classes",
      description: "View and manage your class schedule",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      path: "/teacher/classes",
      color: "blue",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Welcome Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                      Teacher Dashboard
                    </h1>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action) => (
                  <div 
                    key={action.title}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group`}
                  >
                    <div className={`p-6 ${action.bgColor}`}>
                      <svg className={`w-8 h-8 text-${action.color}-600 transform group-hover:scale-110 transition-transform duration-300`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                      </svg>
                    </div>
                    <div className="p-6">
                      <h3 className={`text-lg font-semibold text-gray-800 group-hover:text-${action.color}-600 transition-colors duration-300`}>
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 mb-4">
                        {action.description}
                      </p>
                      <button
                        onClick={() => navigate(action.path)}
                        className={`w-full bg-${action.color}-600 text-white py-2 px-4 rounded-lg hover:bg-${action.color}-700 
                          transition-colors flex items-center justify-center space-x-2`}
                      >
                        <span>View {action.title}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherPage;
