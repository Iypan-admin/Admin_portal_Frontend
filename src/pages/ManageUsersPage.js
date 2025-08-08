import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import {
  createUser,
  getAllUsers,
  deleteUser,
  editUser,
  assignTeacher,
  assignAcademicCoordinator,
  assignManager,
  assignFinancialPartner
} from "../services/Api";
import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";
import AssignTeacherModal from "../components/AssignTeacherModal";
import AssignAdminModal from "../components/AssignAdminModal";
import AssignAcademicModal from "../components/AssignAcademicModal";
import AssignManagerModal from "../components/AssignManagerModal";
import AssignFinancialModal from "../components/AssignFinancialModal";
import { ROLE_CONFIG } from "../config/roleConfig";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignAcademicModal, setShowAssignAcademicModal] = useState(false);
  const [selectedAcademicId, setSelectedAcademicId] = useState(null);
  const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [showAssignFinancialModal, setShowAssignFinancialModal] = useState(false);
  const [selectedFinancialId, setSelectedFinancialId] = useState(null);

  const useDebounce = (callback, delay) => {
    const debouncedFn = useCallback(
      (...args) => {
        const timeoutId = setTimeout(() => callback(...args), delay);
        return () => clearTimeout(timeoutId);
      },
      [callback, delay]
    );
    return debouncedFn;
  };

  const getRoleOptions = () => {
    switch (role) {
      case "admin":
        return (
          <>
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="financial">Financial</option>
            <option value="academic">Academic</option>
            <option value="state">State</option>
            <option value="center">Center</option>
            <option value="teacher">Teacher</option>
            <option value="cardadmin">cardadmin</option>
          </>
        );
      case "manager":
        return (
          <>
            <option value="all">All Roles</option>
            <option value="state">State</option>
            <option value="center">Center</option>
          </>
        );
      case "academic":
        return <option value="teacher">Teacher</option>;
      case "financial":
        return (
          <>
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="academic">Academic</option>
            <option value="state">State</option>
            <option value="center">Center</option>
            <option value="teacher">Teacher</option>
          </>
        );
      default:
        return (
          <option value="all">All Roles</option>
        );
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const searchParams = {
        pagination: false,
        limit: 9999,
      };

      if (debouncedSearchTerm) {
        searchParams.search = debouncedSearchTerm;
      }

      // Role-specific filtering
      if (role === "academic") {
        searchParams.role = "teacher";
      } else if (role === "manager") {
        if (filterRole !== "all") {
          searchParams.role = filterRole;
        }
        // We'll filter for state/center in the frontend
      } else if (filterRole !== "all") {
        searchParams.role = filterRole;
      }

      const response = await getAllUsers(1, 9999, searchParams);

      if (response && response.data) {
        let filteredData = Array.isArray(response.data) ? response.data : [];

        // Additional role-specific filtering
        if (role === "manager") {
          filteredData = filteredData.filter((user) =>
            ["state", "center"].includes(user.role?.toLowerCase())
          );
        } else if (role === "academic") {
          filteredData = filteredData.filter((user) =>
            user.role?.toLowerCase() === "teacher"
          );
        }

        setUsers(filteredData);
      } else {
        setError("No data received from server");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filterRole, role]);

  const debouncedSetSearchTerm = useDebounce((value) => {
    setDebouncedSearchTerm(value);
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setRole(decodedToken.role.toLowerCase());
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    console.log("Current role:", role);
    console.log("Available roles:", ROLE_CONFIG[role]?.allowedRoles);
  }, [role]);

  useEffect(() => {
    fetchUsers(1);
  }, [debouncedSearchTerm, filterRole, fetchUsers]);

  const handleCreateUser = async (userData) => {
    try {
      setError(null);
      await createUser(userData);
      fetchUsers();
      setShowCreateUserModal(false);
    } catch (error) {
      setError(error.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await deleteUser(userId);

      // Show success message
      alert("User deleted successfully");

      // Refresh the users list after successful deletion
      await fetchUsers();

    } catch (error) {
      console.error("Delete user error:", error);
      setError(typeof error === 'string' ? error : error.message || "Failed to delete user");

      // Show error message to user
      alert("Failed to delete user: " + (error.message || "Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterRoleChange = (value) => {
    setFilterRole(value);
  };

  const getFilteredUsers = useCallback(() => {
    if (!Array.isArray(users)) {
      console.error("Users is not an array:", users);
      return [];
    }

    const filteredUsers = users.filter((user) => {
      if (!user) return false;

      const matchesSearch = user.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      // For academic role, only show teachers
      if (role === "academic") {
        return matchesSearch && user.role?.toLowerCase() === "teacher";
      }

      // For manager role
      if (role === "manager") {
        if (filterRole === "all") {
          return (
            matchesSearch &&
            ["state", "center"].includes(user.role?.toLowerCase())
          );
        }
        return (
          matchesSearch &&
          user.role?.toLowerCase() === filterRole.toLowerCase() &&
          ["state", "center"].includes(user.role?.toLowerCase())
        );
      }

      // For other roles
      if (filterRole === "all") {
        return matchesSearch;
      }
      return (
        matchesSearch && user.role?.toLowerCase() === filterRole.toLowerCase()
      );
    });

    // Sort users: inactive first (status: false), then active (status: true)
    return filteredUsers.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status ? 1 : -1; // If a is active (true), move it after b
    });
  }, [users, searchTerm, filterRole, role]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await editUser(userId, userData, token);
      fetchUsers();
      setShowEditUserModal(false);
      setEditingUser(null);
    } catch (error) {
      setError(error.message || 'Failed to update user');
    }
  };

  const handleAssignTeacher = async (teacherId, centerId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await assignTeacher({ userId: teacherId, centerId }, token);
      setShowAssignModal(false);
      await fetchUsers();
    } catch (error) {
      setError(error.message || 'Failed to assign teacher');
    }
  };

  const handleAssignAdmin = async () => {
    await fetchUsers();
    setShowAssignAdminModal(false);
    setSelectedUser(null);
  };

  const handleAssignAcademicCoordinator = async (academicId, managerId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await assignAcademicCoordinator({ userId: academicId, managerId }, token);
      setShowAssignAcademicModal(false);
      await fetchUsers();
    } catch (error) {
      setError(error.message || 'Failed to assign academic coordinator');
    }
  };

  const handleAssignManager = async (managerId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await assignManager({ userId: managerId }, token);
      setShowAssignManagerModal(false);
      await fetchUsers();
    } catch (error) {
      setError(error.message || 'Failed to assign manager');
    }
  };

  const handleAssignFinancialPartner = async (financialId, managerId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await assignFinancialPartner({ userId: financialId, managerId }, token);
      setShowAssignFinancialModal(false);
      await fetchUsers();
    } catch (error) {
      setError(error.message || 'Failed to assign financial partner');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {role === "academic" ? "Manage Teachers" : "Manage Users"}
                  </h1>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                           transition duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                    onClick={() => setShowCreateUserModal(true)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {role === "academic" ? "Add Teacher" : "Create User"}
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  />
                  <select
                    value={filterRole}
                    onChange={(e) => handleFilterRoleChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
                  >
                    {getRoleOptions()}
                  </select>
                </div>

                {error && (
                  <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                    <p>{error}</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/4">
                            Username
                          </th>
                          <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/6">
                            Role
                          </th>
                          <th scope="col" className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/4">
                            Created At
                          </th>
                          <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/6">
                            Status
                          </th>
                          <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-auto">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="px-4 sm:px-6 py-8 text-center">
                              <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                              </div>
                            </td>
                          </tr>
                        ) : getFilteredUsers().length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>No users found</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          getFilteredUsers().map((user) => (
                            <tr
                              key={user.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[150px] sm:max-w-xs">
                                {user.name}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 inline-block">
                                  {user.role}
                                </span>
                              </td>
                              <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(user.created_at).toLocaleString()}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {user.status
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>
                              <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  <button
                                    className="text-blue-600 hover:text-blue-900 transition duration-200"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    Edit
                                  </button>
                                  {( // Allow both admin and manager to assign state/center admins
                                    ((role === 'manager' || role === 'admin') && !user.status && (user.role === 'state' || user.role === 'center'))
                                  ) && (
                                      <button
                                        className="text-green-600 hover:text-green-900 transition duration-200"
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setShowAssignAdminModal(true);
                                        }}
                                      >
                                        Assign
                                      </button>
                                    )}
                                  {role === 'admin' && !user.status && user.role === 'academic' && (
                                    <button
                                      className="text-green-600 hover:text-green-900 transition duration-200"
                                      onClick={() => {
                                        setSelectedAcademicId(user.id);
                                        setShowAssignAcademicModal(true);
                                      }}
                                    >
                                      Assign
                                    </button>
                                  )}
                                  {role === 'admin' && !user.status && user.role === 'manager' && (
                                    <button
                                      className="text-green-600 hover:text-green-900 transition duration-200"
                                      onClick={() => {
                                        setSelectedManagerId(user.id);
                                        setShowAssignManagerModal(true);
                                      }}
                                    >
                                      Assign
                                    </button>
                                  )}
                                  {role === 'admin' && !user.status && user.role === 'financial' && (
                                    <button
                                      className="text-green-600 hover:text-green-900 transition duration-200"
                                      onClick={() => {
                                        setSelectedFinancialId(user.id);
                                        setShowAssignFinancialModal(true);
                                      }}
                                    >
                                      Assign
                                    </button>
                                  )}
                                  {role === 'academic' && user.role === 'teacher' && !user.status && (
                                    <button
                                      className="text-green-600 hover:text-green-900 transition duration-200"
                                      onClick={() => {
                                        setSelectedTeacherId(user.id);
                                        setShowAssignModal(true);
                                      }}
                                    >
                                      Assign
                                    </button>
                                  )}
                                  {/* Only show Delete button if user is inactive */}
                                  {!user.status && (
                                    <button
                                      className="text-red-600 hover:text-red-900 transition duration-200"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateUserModal && (
        <CreateUserModal
          onClose={() => setShowCreateUserModal(false)}
          onCreateUser={handleCreateUser}
          currentUserRole={role}
          forcedRole={role === "academic" ? "teacher" : undefined}
        />
      )}

      {showEditUserModal && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          onUpdate={handleUpdateUser}
        />
      )}

      {showAssignModal && (
        <AssignTeacherModal
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTeacherId(null);
          }}
          onAssign={handleAssignTeacher}
          teacherId={selectedTeacherId}
        />
      )}

      {showAssignAdminModal && selectedUser && (
        <AssignAdminModal
          user={selectedUser}
          onClose={() => {
            setShowAssignAdminModal(false);
            setSelectedUser(null);
          }}
          onAssign={handleAssignAdmin}
        />
      )}

      {showAssignAcademicModal && (
        <AssignAcademicModal
          onClose={() => {
            setShowAssignAcademicModal(false);
            setSelectedAcademicId(null);
          }}
          onAssign={handleAssignAcademicCoordinator}
          academicId={selectedAcademicId}
        />
      )}

      {showAssignManagerModal && (
        <AssignManagerModal
          onClose={() => {
            setShowAssignManagerModal(false);
            setSelectedManagerId(null);
          }}
          onAssign={handleAssignManager}
          managerId={selectedManagerId}
        />
      )}

      {showAssignFinancialModal && (
        <AssignFinancialModal
          onClose={() => {
            setShowAssignFinancialModal(false);
            setSelectedFinancialId(null);
          }}
          onAssign={handleAssignFinancialPartner}
          financialId={selectedFinancialId}
        />
      )}
    </div>
  );
};

export default ManageUsersPage;