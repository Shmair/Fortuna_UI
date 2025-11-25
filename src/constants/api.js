// API Configuration and Endpoints
export const API_BASE = process.env.REACT_APP_API_BASE;

// Base API endpoints
export const API_ENDPOINTS = {
  PROFILE: {
    GET: (userId) => `${API_BASE}/api/profile?user_id=${encodeURIComponent(userId)}`,
    POST: `${API_BASE}/api/profile`,
    PUT: (userId) => `${API_BASE}/api/profile/${userId}`,
    DELETE: (userId) => `${API_BASE}/api/profile/${userId}`
  },
  POLICY: {
    UPLOAD: `${API_BASE}/api/policy`,
    GET: (userId) => `${API_BASE}/api/policy?user_id=${encodeURIComponent(userId)}`,
    GET_BY_HASH: (fileHash) => `${API_BASE}/api/policy?file_hash=${encodeURIComponent(fileHash)}`,
    GET_BY_ID: (policyId) => `${API_BASE}/api/policy/${policyId}`,
    DELETE: (policyId) => `${API_BASE}/api/policy/${policyId}`,
    NOTIFICATIONS: (policyId) => `${API_BASE}/api/policy/${policyId}/notifications`
  },
  AUTH: {
    LOGIN: `${API_BASE}/api/auth/login`,
    LOGOUT: `${API_BASE}/api/auth/logout`,
    REFRESH: `${API_BASE}/api/auth/refresh`
  }
};

// HTTP Headers
export const HEADERS = {
  JSON: {
    'Content-Type': 'application/json'
  },
  FORM_DATA: {
    'Content-Type': 'multipart/form-data'
  },
  AUTH: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// API Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error: Unable to connect to server',
  TIMEOUT: 'Request timeout: Server took too long to respond',
  INVALID_RESPONSE: 'Invalid response format from server',
  UNAUTHORIZED: 'Unauthorized: Please log in again',
  FORBIDDEN: 'Forbidden: You do not have permission to access this resource',
  NOT_FOUND: 'Not found: The requested resource was not found',
  SERVER_ERROR: 'Server error: Something went wrong on the server',
  VALIDATION_ERROR: 'Validation error: Please check your input'
};

// API Success Messages
export const API_SUCCESS = {
  PROFILE_SAVED: 'Profile saved successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_DELETED: 'Profile deleted successfully',
  POLICY_UPLOADED: 'Policy uploaded successfully',
  POLICY_DELETED: 'Policy deleted successfully'
};

// Request Configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 20000, // 20 seconds to accommodate upstream LLM
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1200 // 1.2 seconds (basic backoff)
};
