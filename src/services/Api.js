// api.js

// Define different backend URLs for each service
const AUTH_API_URL = "https://auth.iypan.com"; // For login/authentication
// const USER_API_URL = "https://role.iypan.com"; // For user creation and deletion
// const LIST_API_URL = "https://listing.iypan.com/api"; // For listing services  
const ASSIGN_API_URL = "https://assign.iypan.com"; // For Assigning services
// const FINANCE_API_URL = "https://financial.iypan.com/api/financial" // For Financial services
const BATCHES_URL = "https://academic.iypan.com/api/batches"; // For Academic (Batch) services
const GMEETS_API_URL = "https://academic.iypan.com/api/gmeets"; // For Academic (GMeet) services
const NOTES_API_URL = "https://academic.iypan.com/api/notes"; // For Academic (Note) services
const COURSES_API_URL = "https://academic.iypan.com/api/courses/"; // For Academic (Course) services
const CHAT_API_URL = "https://chat.iypan.com"; // For Chat services

const USER_API_URL = "http://localhost:3001";
const LIST_API_URL = "http://localhost:3008/api";
const FINANCE_API_URL = "http://localhost:3007/api/financial";
// const ASSIGN_API_URL = "http://localhost:3002";
// const BATCHES_URL = "http://localhost:3005/api/batches";
// const GMEETS_API_URL = "http://localhost:3005/api/gmeets";
// const NOTES_API_URL = "http://localhost:3005/api/notes";
// const COURSES_API_URL = "http://localhost:3005/api/courses/";
// ----------------------
// Authentication Functions
// ----------------------

// Function for logging in user (authentication API)
export const loginUser = async (name, password) => {
    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        throw error;
    }
};

// ----------------------
// User Management Functions
// ----------------------

// Function for creating a new user (user management API)
export const createUser = async (userData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${USER_API_URL}/user/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        return data;
    } catch (error) {
        throw error;
    }
};

// Function for deleting a user (user management API)
export const deleteUser = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${USER_API_URL}/user/delete/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("Delete user error:", error);
        throw new Error(error.message || "Failed to delete user");
    }
};


/**
 * Edit user details like name and/or password.
 * @param {string} userId - ID of the user to be edited.
 * @param {Object} userData - Object containing `name` and/or `password`.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Message response on success.
 * @throws {Error} - Throws error if the request fails.
 */
export const editUser = async (userId, userData, token) => {
    try {
        const response = await fetch(`${USER_API_URL}/user/edit/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Required for auth
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to update user.");
        }

        return result;
    } catch (error) {
        throw new Error(`Edit User Error: ${error.message}`);
    }
};


// ----------------------
// Listing Service Functions
// ----------------------

// Helper function to get listing service auth headers
const getListAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});

/**
 * Fetch all users with optional filters
 */
export const getAllUsers = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams({
            ...params
        });

        const response = await fetch(`${LIST_API_URL}/users?${queryParams}`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch users");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch all students associated with a specific center.
 * @param {string} centerId - The ID of the center.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object[]>} - List of transformed student objects.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getStudentsByCenter = async (centerId, token) => {
    try {
        if (!centerId) throw new Error('Center ID is required');
        if (!token) throw new Error('Token is required');

        const response = await fetch(`${LIST_API_URL}/center/${centerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('API response:', data); // Debug log
        return data; // The API already returns the correct structure

    } catch (error) {
        console.error('getStudentsByCenter error:', error);
        throw error;
    }
};



/**
 * Fetch all batches associated with a specific center.
 * @param {string} centerId - The ID of the center.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object[]>} - Transformed list of batch objects.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getBatchesByCenter = async (centerId, token) => {
    try {
        console.log(`Making API call to ${LIST_API_URL}/batchcenter/${centerId}`);

        const response = await fetch(`${LIST_API_URL}/batchcenter/${centerId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        // Log raw response status
        console.log('API Response Status:', response.status);

        // If not JSON, handle it differently
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            return {
                success: false,
                error: `Server returned non-JSON response (${response.status})`
            };
        }

        const data = await response.json();
        console.log('API Response Data:', data);

        return data;
    } catch (error) {
        console.error('getBatchesByCenter fetch error:', error);
        return {
            success: false,
            error: error.message || 'Network error occurred'
        };
    }
};

/**
 * Fetch user by ID
 */
export const getUserById = async (id) => {
    try {
        const response = await fetch(`${LIST_API_URL}/users/${id}`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "User not found");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch all academic coordinators
 */
export const getAllAcademicCoordinators = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/academic-coordinators`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch academic coordinators");

        // Check the response structure and return formatted data
        if (data && data.success && Array.isArray(data.data)) {
            return {
                success: true,
                data: data.data
            };
        }

        return {
            success: false,
            data: []
        };
    } catch (error) {
        throw error;
    }
};
export const fetchStudentByRegisterNumber = async (registerNumber) => {
    try {
        const response = await fetch(`${LIST_API_URL}/student/register-number/${registerNumber}`, {
            method: "GET",
            headers: getListAuthHeaders(), // same headers as other secure endpoints
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Student not found");
        return data;
    } catch (error) {
        throw error;
    }
};


/**
 * Fetch all centers
 */
export const getAllCenters = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/centers`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch centers");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch center by ID
 */
export const getCenterById = async (id) => {
    try {
        const response = await fetch(`${LIST_API_URL}/centers/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch center details');
        }

        const data = await response.json();
        // Make sure we're returning an object with center_name
        return {
            center_id: id,
            center_name: data.name || data.center_name || 'Unknown Center',
            ...data
        };
    } catch (error) {
        console.error("Error in getCenterById:", error);
        // Return a default object if fetch fails
        return {
            center_id: id,
            center_name: 'Unknown Center'
        };
    }
};

/**
 * Get center details based on the currently authenticated center admin.
 * @param {string} token - Authentication token (Bearer).
 * @returns {Promise<Object>} - The center details.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getCenterByAdminId = async (token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/centers/admin/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const text = await response.text(); // Get raw response as text
        console.log("Raw getCenterByAdminId Response:", text); // Debug log

        const data = JSON.parse(text); // Parse the response as JSON

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch center details');
        }

        return data;
    } catch (error) {
        console.error('getCenterByAdminId error:', error);
        throw error;
    }
};

/**
 * Fetch all centers for the state where the authenticated user is the state_admin.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - API response with centers data.
 */
export const getCentersForStateAdmin = async (token) => {
    try {
        const response = await fetch(
            `${LIST_API_URL}/centers/state/admin/me`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch centers for state admin");
        return data;
    } catch (error) {
        console.error("getCentersForStateAdmin error:", error);
        return {
            success: false,
            message: error.message || "Network error occurred",
            data: [],
        };
    }
};

/**
 * Fetch all enrollments
 */
export const getAllEnrollments = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/enrollments`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch enrollments");
        return data;
    } catch (error) {
        throw error;
    }
};


/**
 * Fetch all financial partners
 */
export const getAllFinancialPartners = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/financial-partners`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch financial partners");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch all managers
 */
export const getAllManagers = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/managers`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch managers");

        // Check the response structure and return formatted data
        if (data && data.success && Array.isArray(data.data)) {
            return {
                success: true,
                data: data.data
            };
        }

        return {
            success: false,
            data: []
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch all states
 */
export const getAllStates = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/states`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Return the full state data
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch state by ID
 */
export const getStateById = async (id) => {
    try {
        const response = await fetch(`${LIST_API_URL}/states/${id}`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "State not found");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch all students
 */
export const getAllStudents = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/students`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch students");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch student by ID
 */
export const getStudentById = async (id) => {
    try {
        const response = await fetch(`${LIST_API_URL}/students/${id}`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Student not found");
        return data;
    } catch (error) {
        throw error;
    }
};
export const getStudentByRegisterNumber = async (registerNumber) => {
    const res = await fetch(`${LIST_API_URL}/by-register/${registerNumber}`, {
        method: 'GET',
        headers: getListAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Student not found');

    return data.name; // since your response is { name: "..." }
};



/**
 * Fetch all teachers
 */
export const getAllTeachers = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/teachers`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch teachers");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch teacher by ID
 */
export const getTeacherById = async (id) => {
    try {
        const response = await fetch(`${LIST_API_URL}/teachers/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch teacher details');
        }

        const data = await response.json();
        // Make sure we're returning an object with name
        return {
            teacher_id: id,
            name: data.name || data.teacher_name || 'Unknown Teacher',
            ...data
        };
    } catch (error) {
        console.error("Error in getTeacherById:", error);
        // Return a default object if fetch fails
        return {
            teacher_id: id,
            name: 'Unknown Teacher'
        };
    }
};


/**
 * Fetch transaction by Payment ID
 */
export const getTransactionById = async (id) => {
    try {
        const response = await fetch(`${LIST_API_URL}/transactions/${id}`, {
            method: "GET",
            headers: getListAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Transaction not found");
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch all batches assigned to a teacher
 */
export const getTeacherBatches = async (token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/batches`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch teacher batches");

        // Return transformed data
        return data;
    } catch (error) {
        throw new Error(`Get Teacher Batches Error: ${error.message}`);
    }
};

/**
 * Fetch all students assigned to a teacher
 */
export const getStudentsByTeacher = async (token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/students`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch students assigned to teacher");

        // Return transformed data
        return data;
    } catch (error) {
        throw new Error(`Get Students By Teacher Error: ${error.message}`);
    }
};

/**
 * Get students in a specific batch assigned to the authenticated teacher.
 * @param {string} batchId - ID of the batch.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object[]>} - List of students in the batch.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTeacherBatchStudents = async (batchId, token) => {
    try {
        if (!batchId) {
            throw new Error("Batch ID is required");
        }

        if (!token) {
            throw new Error("Authentication token is required");
        }

        // Fix: Updated API endpoint to match the correct route
        const response = await fetch(`${LIST_API_URL}/batch/${batchId}/students`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Error ${response.status}`);
        }

        return result;

    } catch (error) {
        console.error("Error fetching batch students:", error);
        throw error;
    }
};

export const getBatchById = async (token, batchId) => {
    try {
        const response = await fetch(`${LIST_API_URL}/batches/${batchId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch batch details');
        }

        return data;
    } catch (error) {
        console.error('getBatchById error:', error);
        throw error;
    }
};


/**
 * Fetch all teachers assigned to a specific center.
 * @param {string} centerId - The ID of the center.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object[]>} - List of teachers assigned to the center.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getTeachersByCenter = async (centerId, token) => {
    try {
        if (!centerId) {
            throw new Error('Center ID is required');
        }

        const response = await fetch(`${LIST_API_URL}/center/${centerId}/teachers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch teachers');
        }

        return data;
    } catch (error) {
        console.error('getTeachersByCenter error:', error);
        throw error;
    }
};
export const fetchEliteCards = async () => {
    const token = localStorage.getItem("token"); // Retrieve the JWT token

    const response = await fetch(`${LIST_API_URL}/elite-cards`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Failed to fetch elite cards");
    }

    return result.data;
};

export const addEliteCard = async (formData) => {
    const token = localStorage.getItem("token"); // Retrieve the JWT token

    const response = await fetch(`${LIST_API_URL}/elite-cards`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Failed to add elite card");
    }

    return result;
};


export const getInfluencerCount = async () => {
    const res = await fetch(`${LIST_API_URL}/influencers/count`);
    if (!res.ok) throw new Error("Failed to fetch count");
    return await res.json(); // { count: number }
};

// ✅ Get ALL influencers (updated to remove /latest)
export const getAllInfluencers = async () => {
    const res = await fetch(`${LIST_API_URL}/influencers`);
    if (!res.ok) throw new Error("Failed to fetch influencer list");
    return await res.json(); // array of all influencer objects
};

// Submit new influencer (form)
export const submitInfluencer = async (formData) => {
    const res = await fetch(`${LIST_API_URL}/influencers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit influencer");
    return data;
};
// ✅ Get all pending elite cards (Card Admin verification list)
export const getPendingEliteCards = async (token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/card-admin/pending`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Error ${response.status}`);
        }

        return result.cards; // backend la {cards: [...]} return pannum nu assume panniruken
    } catch (error) {
        console.error("Error fetching pending elite cards:", error);
        throw error;
    }
};

// ✅ Approve elite card
export const approveEliteCard = async (id, token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/card-admin/approve/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Error ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error("Error approving elite card:", error);
        throw error;
    }
};

// ✅ Reject elite card
export const rejectEliteCard = async (id, token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/card-admin/reject/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Error ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error("Error rejecting elite card:", error);
        throw error;
    }
};

// ✅ Get all approved elite cards
export const getApprovedEliteCards = async (token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/card-admin/approved`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Error ${response.status}`);
        }

        return result.cards;
    } catch (error) {
        console.error("Error fetching approved elite cards:", error);
        throw error;
    }
};

// ----------------------
// Role Assigning Service Functions
// ----------------------

/**
 * Create a new state.
 * @param {Object} payload - { stateName }
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Response from server.
 */
export const createState = async (payload, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/manager/state/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create state");

        return data;
    } catch (error) {
        throw new Error(`Create State Error: ${error.message}`);
    }
};

/**
 * Create a new center.
 * @param {Object} payload - { centerName, stateId }
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Response from server.
 */
export const createCenter = async (payload, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/manager/center/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create center");

        return data;
    } catch (error) {
        throw new Error(`Create Center Error: ${error.message}`);
    }
};

/**
 * Assign a state admin.
 * @param {Object} payload - { stateId, userId, academicCoordinatorId }
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Response from server.
 */
export const assignStateAdmin = async (payload, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/manager/state/assign-admin`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to assign state admin");

        return data;
    } catch (error) {
        throw new Error(`Assign State Admin Error: ${error.message}`);
    }
};

/**
 * Assign a center admin
 * @param {Object} payload - { centerId, userId }
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from server
 */
export const assignCenterAdmin = async (payload, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/manager/center/assign-admin`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to assign center admin");

        return data;
    } catch (error) {
        throw new Error(`Assign Center Admin Error: ${error.message}`);
    }
};



/**
 * Assign a teacher to a center.
 * @param {Object} assignmentData - The data required for the assignment.
 * @param {string} assignmentData.userId - The ID of the teacher.
 * @param {string} assignmentData.centerId - The ID of the center.
 * @param {string} token - Authentication token for API access.
 * @returns {Promise<Object>} - Response containing the assignment status.
 * @throws {Error} - Throws an error if the request fails.
 */
export const assignTeacher = async (assignmentData, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/academic/assign-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assignmentData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to assign teacher.");
        }

        return result; // Contains the success message or additional data
    } catch (error) {
        throw new Error(`Assign Teacher Error: ${error.message}`);
    }
};

/**
 * Assigns a user with an academic role to a manager
 * @param {Object} assignmentData - The assignment data.
 * @param {string} assignmentData.userId - The ID of the academic coordinator.
 * @param {string} assignmentData.managerId - The ID of the manager.
 * @param {string} token - Authentication token for API access.
 * @returns {Promise<Object>} - Response containing the assignment status.
 * @throws {Error} - Throws an error if the request fails.
 */
export const assignAcademicCoordinator = async (assignmentData, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/admin/assign-academic-coordinator`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assignmentData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to assign academic coordinator.");
        }

        return result;
    } catch (error) {
        throw new Error(`Assign Academic Coordinator Error: ${error.message}`);
    }
};

/**
 * Assigns a user with the manager role
 * @param {Object} assignmentData - The assignment data.
 * @param {string} assignmentData.userId - The ID of the user to be assigned as manager.
 * @param {string} token - Authentication token for API access.
 * @returns {Promise<Object>} - Response containing the assignment status.
 * @throws {Error} - Throws an error if the request fails.
 */
export const assignManager = async (assignmentData, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/admin/assign-manager`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assignmentData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to assign manager.");
        }

        return result;
    } catch (error) {
        throw new Error(`Assign Manager Error: ${error.message}`);
    }
};

/**
 * Assigns a user with the financial partner role to a manager
 * @param {Object} assignmentData - The assignment data.
 * @param {string} assignmentData.userId - The ID of the user to be assigned as financial partner.
 * @param {string} assignmentData.managerId - The ID of the manager to assign the financial partner to.
 * @param {string} token - Authentication token for API access.
 * @returns {Promise<Object>} - Response containing the assignment status.
 * @throws {Error} - Throws an error if the request fails.
 */
export const assignFinancialPartner = async (assignmentData, token) => {
    try {
        const response = await fetch(`${ASSIGN_API_URL}/admin/assign-financial-partner`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assignmentData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to assign financial partner.");
        }

        return result;
    } catch (error) {
        throw new Error(`Assign Financial Partner Error: ${error.message}`);
    }
};

// ----------------------
// Financial Service Functions
// ----------------------

export const approvePayment = async (transaction_id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${FINANCE_API_URL}/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ transaction_id }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        return data;
    } catch (error) {
        throw error;
    }
};

export const getAllTransactions = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${FINANCE_API_URL}/transactions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        console.log("Transactions response:", data); // Add logging
        return data;
    } catch (error) {
        console.error("Failed to fetch transactions:", error); // Add error logging
        throw error;
    }
};

export const editTransactionDuration = async (transaction_id, new_duration) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${FINANCE_API_URL}/transaction/edit`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ transaction_id, new_duration }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        return data;
    } catch (error) {
        throw error;
    }
};

export const getPendingElitePayments = async () => {
    try {
        const res = await fetch(`${FINANCE_API_URL}/elite-payments/pending-approvals`);
        if (!res.ok) throw new Error("Failed to fetch pending elite payments");

        const json = await res.json();
        return Array.isArray(json.data) ? json.data : []; // return only array
    } catch (error) {
        console.error("Error fetching pending elite payments:", error);
        return []; // fallback empty array so .map won't crash
    }
};


// 🔹 Approve elite payment
export const approveElitePayment = async (id) => {
    try {
        const res = await fetch(`${FINANCE_API_URL}/elite-payments/${id}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to approve payment");
        return await res.json();
    } catch (error) {
        console.error("Error approving payment:", error);
        throw error;
    }
};

// 🔹 Decline elite payment
export const declineElitePayment = async (id) => {
    try {
        const res = await fetch(`${FINANCE_API_URL}/elite-payments/${id}/decline`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to decline payment");
        return await res.json();
    } catch (error) {
        console.error("Error declining payment:", error);
        throw error;
    }
};
// 🔹 Get all pending/approved/declined giveaways
export const getPendingGiveaways = async () => {
    try {
        const res = await fetch(`${FINANCE_API_URL}/giveaways/pending-approvals`);
        if (!res.ok) throw new Error("Failed to fetch pending giveaways");

        const json = await res.json();
        return Array.isArray(json.data) ? json.data : []; // return only array
    } catch (error) {
        console.error("Error fetching pending giveaways:", error);
        return []; // fallback empty array so .map won't crash
    }
};

// 🔹 Approve giveaway
export const approveGiveaway = async (id) => {
    if (!id) throw new Error("Giveaway ID is required");

    try {
        const res = await fetch(`${FINANCE_API_URL}/giveaways/${id}/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Some APIs return 204 No Content
        let data = null;
        if (res.status !== 204) {
            try {
                data = await res.json();
            } catch {
                data = null;
            }
        }

        if (!res.ok) {
            const message = data?.error || data?.message || "Failed to approve giveaway";
            throw new Error(message);
        }

        return data;
    } catch (error) {
        console.error(`Error approving giveaway [ID: ${id}]:`, error.message);
        throw error;
    }
};


export const declineGiveaway = async (id) => {
    try {
        const res = await fetch(`${FINANCE_API_URL}/giveaways/${id}/decline`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) {
            const message = data?.error || "Failed to decline giveaway";
            throw new Error(message);
        }
        return data;
    } catch (error) {
        console.error(`Error declining giveaway [ID: ${id}]:`, error.message);
        throw error;
    }
};


// ----------------------
// Academic Service Functions
// ----------------------

// Create Batch
export const createBatch = async (token, batchDetails) => {
    try {
        const response = await fetch(`${BATCHES_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(batchDetails),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        return data;
    } catch (error) {
        throw error;
    }
};

// Get All Batches
export const getBatches = async (token) => {
    try {
        const response = await fetch(`${BATCHES_URL}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch batches');
        }

        return data; // Return the data directly since it already has the correct structure
    } catch (error) {
        console.error("Error in getBatches:", error);
        throw error;
    }
};

// Update Batch
export const updateBatch = async (token, id, batchDetails) => {
    try {
        const response = await fetch(`${BATCHES_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(batchDetails),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return {
            success: true,
            message: "Batch updated successfully",
            data: data.batch
        };
    } catch (error) {
        console.error("Update batch error:", error);
        throw new Error(error.message || "Failed to update batch");
    }
};

// Delete Batch
export const deleteBatch = async (token, id) => {
    try {
        console.log(`Deleting batch ${id} from ${BATCHES_URL}/${id}`); // Debug log

        const response = await fetch(`${BATCHES_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Delete API response:", response); // Debug log

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Delete batch API error:", error); // Debug log
        throw error;
    }
};

export const approveStudent = async (token, student_id) => {
    try {
        // Validate input
        if (!student_id) {
            throw new Error("Student ID is required");
        }

        // API request
        const response = await fetch(`${BATCHES_URL}/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ student_id }),
        });

        // Parse response
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Request failed");

        // Return data
        return data;
    } catch (error) {
        throw new Error(`Approve Student Error: ${error.message}`);
    }
};

/**
 * Create a GMeet
 * @param {Object} gmeetData - Data for the new GMeet
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Created GMeet details
 */
export const createGMeet = async (gmeetData, token) => {
    try {
        const response = await fetch(`${GMEETS_API_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gmeetData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create GMeet");

        return data;
    } catch (error) {
        throw new Error(`Create GMeet Error: ${error.message}`);
    }
};

/**
 * Get all GMeets for a specific batch
 * @param {string} batchId - Batch ID
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} - List of GMeets for the batch
 */
export const getGMeetsByBatch = async (batchId, token) => {
    try {
        const response = await fetch(`${GMEETS_API_URL}/${batchId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch GMeets by batch");

        return data;
    } catch (error) {
        throw new Error(`Get GMeets By Batch Error: ${error.message}`);
    }
};

/**
 * Get a specific GMeet by ID
 * @param {string} meetId - GMeet ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Details of the GMeet
 */
export const getGMeetById = async (meetId, token) => {
    try {
        const response = await fetch(`${GMEETS_API_URL}/meet/${meetId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch GMeet by ID");

        return data;
    } catch (error) {
        throw new Error(`Get GMeet By ID Error: ${error.message}`);
    }
};

/**
 * Update a GMeet
 * @param {string} meetId - GMeet ID
 * @param {Object} updates - Updates for the GMeet
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Updated GMeet details
 */
export const updateGMeet = async (meetId, updates, token) => {
    try {
        const response = await fetch(`${GMEETS_API_URL}/${meetId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update GMeet");

        return data;
    } catch (error) {
        throw new Error(`Update GMeet Error: ${error.message}`);
    }
};

/**
 * Delete a GMeet
 * @param {string} meetId - GMeet ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteGMeet = async (meetId, token) => {
    try {
        const response = await fetch(`${GMEETS_API_URL}/${meetId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to delete GMeet");

        return data;
    } catch (error) {
        throw new Error(`Delete GMeet Error: ${error.message}`);
    }
};



/**
 * Create a new note
 * @param {Object} noteData - Note details (link, batch_id, title, note)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Created note details
 */
export const createNote = async (noteData, token) => {
    try {
        const response = await fetch(`${NOTES_API_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(noteData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create note");

        return data;
    } catch (error) {
        throw new Error(`Create Note Error: ${error.message}`);
    }
};

/**
 * Get all notes for a specific batch
 * @param {string} batchId - Batch ID
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} - List of notes for the batch
 */
export const getNotes = async (batchId, token) => {
    try {
        const response = await fetch(`${NOTES_API_URL}/?batch_id=${batchId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch notes");

        return data;
    } catch (error) {
        throw new Error(`Get Notes Error: ${error.message}`);
    }
};

/**
 * Get a note by its ID
 * @param {string} noteId - Note ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Details of the note
 */
export const getNoteById = async (noteId, token) => {
    try {
        const response = await fetch(`${NOTES_API_URL}/${noteId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch note by ID");

        return data;
    } catch (error) {
        throw new Error(`Get Note By ID Error: ${error.message}`);
    }
};

/**
 * Update a note by its ID
 * @param {string} noteId - Note ID
 * @param {Object} noteData - Updated note details (link, batch_id, title, note)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Updated note details
 */
export const updateNote = async (noteId, noteData, token) => {
    try {
        const response = await fetch(`${NOTES_API_URL}/${noteId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(noteData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update note");

        return data;
    } catch (error) {
        throw new Error(`Update Note Error: ${error.message}`);
    }
};

/**
 * Delete a note by its ID
 * @param {string} noteId - Note ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteNote = async (noteId, token) => {
    try {
        const response = await fetch(`${NOTES_API_URL}/${noteId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to delete note");

        return data;
    } catch (error) {
        throw new Error(`Delete Note Error: ${error.message}`);
    }
};



/**
 * Create a new course.
 * @param {Object} courseData - The data for the course to be created.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Response containing the created course or an error message.
 * @throws {Error} - Throws an error if the request fails.
 */
export const createCourse = async (courseData, token) => {
    try {
        const response = await fetch(`${COURSES_API_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create course");

        return {
            success: true,
            data: data.course[0] // Backend returns array of inserted records
        };
    } catch (error) {
        throw new Error(`Create Course Error: ${error.message}`);
    }
};

/**
 * Update an existing course
 * @param {string} courseId - ID of the course to update
 * @param {Object} courseData - Updated course data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response containing updated course data
 */
export const updateCourse = async (courseId, courseData, token) => {
    try {
        const response = await fetch(`${COURSES_API_URL}/${courseId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update course");

        return {
            success: true,
            data: data.course
        };
    } catch (error) {
        throw new Error(`Update Course Error: ${error.message}`);
    }
};

/**
 * Delete a course
 * @param {string} courseId - ID of the course to delete
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response containing success message
 */
export const deleteCourse = async (courseId, token) => {
    try {
        const response = await fetch(`${COURSES_API_URL}/${courseId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to delete course");

        return {
            success: true,
            message: data.message
        };
    } catch (error) {
        throw new Error(`Delete Course Error: ${error.message}`);
    }
};

/**
 * Fetch all courses with optional pagination
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Response containing courses data
 * @throws {Error} - Throws an error if the request fails
 */
export const getAllCourses = async (token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/courses`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch courses");
        }

        return {
            success: true,
            data: data.data || [] // Ensure we always return an array
        };
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw new Error(`Get Courses Error: ${error.message}`);
    }
};

/**
 * Fetch a single course by ID
 * @param {string} id - Course ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Response containing course details
 * @throws {Error} - Throws an error if the request fails
 */
export const getCourseById = async (id, token) => {
    try {
        const response = await fetch(`${LIST_API_URL}/courses/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Course not found");
        }

        return data;
    } catch (error) {
        console.error("Error fetching course:", error);
        throw new Error(`Get Course Error: ${error.message}`);
    }
};

// ----------------------
// Chat Service Functions
// ----------------------

/**
 * Create a new chat message.
 * @param {Object} chatData - Data for the new chat message.
 * @param {string} chatData.text - Text of the chat message.
 * @param {string} chatData.batch_id - Batch ID associated with the message.
 * @returns {Promise<Object>} - Response from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const createChatMessage = async (chatData) => {
    try {
        const response = await fetch(`${CHAT_API_URL}/chats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(chatData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to create chat message.");
        }

        return result;
    } catch (error) {
        throw new Error(`Create Chat Message Error: ${error.message}`);
    }
};

/**
 * Fetch previous chat messages for a specific batch.
 * @param {string} batchId - ID of the batch.
 * @returns {Promise<Array>} - List of chat messages.
 * @throws {Error} - Throws an error if the request fails.
 */
export const fetchChatMessages = async (batchId) => {
    try {
        const response = await fetch(`${CHAT_API_URL}/chats/${batchId}`, {
            method: "GET",
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to fetch chat messages.");
        }

        return result;
    } catch (error) {
        throw new Error(`Fetch Chat Messages Error: ${error.message}`);
    }
};

/**
 * Update an existing chat message.
 * @param {string} messageId - ID of the chat message to update.
 * @param {Object} updateData - Data to update the chat message.
 * @param {string} updateData.text - Updated text for the chat message.
 * @returns {Promise<Object>} - Response from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const updateChatMessage = async (messageId, updateData) => {
    try {
        const response = await fetch(`${CHAT_API_URL}/chats/${messageId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to update chat message.");
        }

        return result;
    } catch (error) {
        throw new Error(`Update Chat Message Error: ${error.message}`);
    }
};

/**
 * Delete a chat message.
 * @param {string} messageId - ID of the chat message to delete.
 * @returns {Promise<Object>} - Response from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const deleteChatMessage = async (messageId) => {
    try {
        const response = await fetch(`${CHAT_API_URL}/chats/${messageId}`, {
            method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to delete chat message.");
        }

        return result;
    } catch (error) {
        throw new Error(`Delete Chat Message Error: ${error.message}`);
    }
};

/**
 * Edit center name.
 * @param {Object} data - Data containing center details.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Response from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const editCenterName = async (data, token) => {
    const response = await fetch(`${ASSIGN_API_URL}/manager/edit-center-name`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to edit center name");
    }

    return response.json();
};

/**
 * Edit state name.
 * @param {Object} data - Data containing state details.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Response from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export const editStateName = async (data, token) => {
    const response = await fetch(`${ASSIGN_API_URL}/manager/edit-state-name`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to edit state name");
    }

    return response.json();
};


// =========================
// 📌 GIVEAWAY API
// =========================
// =========================
// 📌 GIVEAWAY / CARD UPLOAD API
// =========================

// ✅ Upload Giveaway CSV
export const uploadGiveawayCSV = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file); // multer upload.single("file")

        const response = await fetch(`${LIST_API_URL}/cards/upload`, {
            method: "POST",
            body: formData, // ❌ Don’t set headers manually
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Upload Giveaway API error:", error);
        throw error;
    }
};

// ✅ Manual Single Insert Giveaway
export const addGiveawayManual = async (entry) => {
    try {
        const response = await fetch(`${LIST_API_URL}/cards/manual`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(entry),
        });

        const data = await response.json(); // 👈 parse pannunga

        if (!response.ok || data.error) {   // 👈 error / status check
            throw new Error(data.error || data.message || "Manual insert failed");
        }

        return data; // ✅ backend response pass pannudhu
    } catch (error) {
        console.error("Add Giveaway Manual API error:", error);
        throw error;
    }
};


// ✅ Get All Giveaways
export const getAllGiveaways = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/cards`);
        if (!response.ok) throw new Error("Failed to fetch giveaways");
        return await response.json();
    } catch (error) {
        console.error("Get Giveaways API error:", error);
        throw error;
    }
};


// =========================
// 📌 CARD API (elite_card_generate)
// =========================

// ✅ Get Card Stats (total, pending, active)
export const getCardStats = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/cards/stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        return {
            total: result.total || 0,
            pending: result.pending || 0,
            active: result.active || 0,
        };
    } catch (error) {
        console.error("Fetch Card Stats API error:", error);
        throw error;
    }
};

// ✅ Get Only Recent Pending Cards (latest 2)
export const getRecentPendingCards = async () => {
    try {
        const response = await fetch(`${LIST_API_URL}/cards/recent-pending`);
        if (!response.ok) throw new Error("Failed to fetch recent pending cards");

        const data = await response.json();

        // Already filtered by status = "card_generated" in backend
        return data.map(item => ({
            name: item.name_on_the_pass,
            email: item.email,
            card_number: item.card_number,
            card_name: item.card_name,
            status: item.status,
            created_at: item.created_at,
        }));
    } catch (error) {
        console.error("Fetch Recent Pending Cards API error:", error);
        throw error;
    }
};
