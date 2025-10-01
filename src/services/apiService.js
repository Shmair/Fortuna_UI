import { API_ENDPOINTS, HEADERS, API_ERRORS, REQUEST_CONFIG } from '../constants/api';

/**
 * Generic API service for making HTTP requests
 */
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE;
  }

  /**
   * Make a generic HTTP request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - The response data
   */
  async request(url, options = {}) {
    const defaultOptions = {
      headers: HEADERS.JSON,
      timeout: REQUEST_CONFIG.TIMEOUT,
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), defaultOptions.timeout);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(API_ERRORS.TIMEOUT);
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(API_ERRORS.NETWORK_ERROR);
      }
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  async get(url, options = {}) {
    return this.request(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * POST request
   * @param {string} url - The URL to make the request to
   * @param {Object} data - The data to send
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * PUT request
   * @param {string} url - The URL to make the request to
   * @param {Object} data - The data to send
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  async put(url, data, options = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * DELETE request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  async delete(url, options = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...options
    });
  }

  // Profile API methods
  async getProfile(userId) {
    return this.get(API_ENDPOINTS.PROFILE.GET(userId));
  }

  async saveProfile(profileData) {
    return this.post(API_ENDPOINTS.PROFILE.POST, profileData);
  }

  async updateProfile(userId, profileData) {
    return this.put(API_ENDPOINTS.PROFILE.PUT(userId), profileData);
  }

  async deleteProfile(userId) {
    return this.delete(API_ENDPOINTS.PROFILE.DELETE(userId));
  }

  // Policy API methods
  async uploadPolicy(formData) {
    return this.request(API_ENDPOINTS.POLICY.UPLOAD, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData
    });
  }

  async getPolicies(userId) {
    return this.get(API_ENDPOINTS.POLICY.GET(userId));
  }

  async getPolicyByHash(fileHash) {
    return this.get(API_ENDPOINTS.POLICY.GET_BY_HASH(fileHash));
  }

  async getPolicy(policyId) {
    return this.get(API_ENDPOINTS.POLICY.GET_BY_ID(policyId));
  }

  async deletePolicy(policyId) {
    return this.delete(API_ENDPOINTS.POLICY.DELETE(policyId));
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
