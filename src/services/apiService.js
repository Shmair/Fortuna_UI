import { API_ENDPOINTS, HEADERS, API_ERRORS, REQUEST_CONFIG } from '../constants/api';
import { POLICY_CHAT } from '../constants/policyChat';
import { supabase } from '../utils/supabaseClient';

/**
 * Generic API service for making HTTP requests
 */
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
  }

  /**
   * Get authentication headers with current session token
   * @returns {Promise<Object>} - Headers with authorization
   */
  async getAuthHeaders() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        };
      }
    } catch (error) {
      console.warn('Failed to get auth session:', error);
    }
    return HEADERS.JSON;
  }

  /**
   * Make a generic HTTP request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - Fetch options
   * @param {boolean} requireAuth - Whether to include auth headers
   * @returns {Promise<Object>} - The response data
   */
  async request(url, options = {}, requireAuth = true) {
    const headers = requireAuth ? await this.getAuthHeaders() : HEADERS.JSON;
    const defaultOptions = {
      headers: { ...headers, ...options.headers },
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
        // Try to parse error response from backend
        try {
          const errorData = await response.json();
          
          // Check for Hebrew error messages first
          if (errorData.hebrewError) {
            throw new Error(errorData.hebrewError);
          }
          
          if (errorData.message) {
            throw new Error(errorData.message);
          } else if (errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (parseError) {
          // If we can't parse the error response, use generic error
          console.warn('Could not parse error response:', parseError);
        }
        
        // Provide more specific error messages based on status code
        if (response.status === 400) {
          throw new Error('שגיאה בהעלאת הקובץ: הקובץ אינו תקין או בפורמט לא נתמך');
        } else if (response.status === 401) {
          throw new Error('שגיאה בהעלאת הקובץ: נדרש להתחבר מחדש');
        } else if (response.status === 413) {
          throw new Error('שגיאה בהעלאת הקובץ: הקובץ גדול מדי');
        } else if (response.status === 500) {
          throw new Error('שגיאה בהעלאת הקובץ: בעיה בשרת, נסה שוב מאוחר יותר');
        }
        
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
   * @param {boolean} requireAuth - Whether to include auth headers
   * @returns {Promise<Object>} - The response data
   */
  async get(url, options = {}, requireAuth = true) {
    return this.request(url, {
      method: 'GET',
      ...options
    }, requireAuth);
  }

  /**
   * POST request
   * @param {string} url - The URL to make the request to
   * @param {Object} data - The data to send
   * @param {Object} options - Additional options
   * @param {boolean} requireAuth - Whether to include auth headers
   * @returns {Promise<Object>} - The response data
   */
  async post(url, data, options = {}, requireAuth = true) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    }, requireAuth);
  }

  /**
   * PUT request
   * @param {string} url - The URL to make the request to
   * @param {Object} data - The data to send
   * @param {Object} options - Additional options
   * @param {boolean} requireAuth - Whether to include auth headers
   * @returns {Promise<Object>} - The response data
   */
  async put(url, data, options = {}, requireAuth = true) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    }, requireAuth);
  }

  /**
   * DELETE request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - Additional options
   * @param {boolean} requireAuth - Whether to include auth headers
   * @returns {Promise<Object>} - The response data
   */
  async delete(url, options = {}, requireAuth = true) {
    return this.request(url, {
      method: 'DELETE',
      ...options
    }, requireAuth);
  }

  // ----- Refund Flow (Cases, Candidates, Documents, Submission) -----
  // Candidates API methods
  async acceptCandidate(candidateId, payload = {}) {
    return this.post(`${this.baseURL}/api/candidates/${candidateId}/accept`, payload);
  }

  async rejectCandidate(candidateId, payload = {}) {
    return this.post(`${this.baseURL}/api/candidates/${candidateId}/reject`, payload);
  }

  // Cases API methods
  async createCase(caseData) {
    return this.post(`${this.baseURL}/api/cases`, caseData);
  }

  async getCase(caseId) {
    return this.get(`${this.baseURL}/api/cases/${caseId}`);
  }

  async updateCase(caseId, data) {
    return this.request(`${this.baseURL}/api/cases/${caseId}`, { method: 'PATCH', headers: HEADERS.JSON, body: JSON.stringify(data) });
  }

  // Documents API methods (Refunds View alignment)
  async uploadCaseDocument(caseId, file) {
    const authHeaders = await this.getAuthHeaders();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    return this.request(`${this.baseURL}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Authorization': authHeaders.Authorization },
      body: formData
    });
  }

  async listCaseDocuments(caseId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.get(`${this.baseURL}/api/documents/case/${caseId}${qs}`);
  }

  // Submission API methods
  async checkSubmissionReady(caseId) {
    return this.get(`${this.baseURL}/api/submission/${caseId}/ready`);
  }

  async submitCase(caseId) {
    return this.post(`${this.baseURL}/api/submission/${caseId}/submit`, {});
  }

  // Embedding retry method
  async retryEmbeddings(policyId) {
    return this.post(`${this.baseURL}/api/policy/${policyId}/retry-embeddings`, {});
  }

  // Conversation state methods
  async getConversationState(sessionId) {
    return this.get(`${this.baseURL}/api/conversation-state/${sessionId}`);
  }

  async saveConversationState(data) {
    return this.post(`${this.baseURL}/api/conversation-state`, data);
  }

  async resetConversationState(sessionId) {
    return this.delete(`${this.baseURL}/api/conversation-state/${sessionId}`);
  }

  // Profile API methods
  async getProfile(userId) {
    return this.get(`${this.baseURL}/api/profile?user_id=${encodeURIComponent(userId)}`);
  }

  async saveProfile(profileData) {
    return this.post(`${this.baseURL}/api/profile`, profileData);
  }

  async updateProfile(userId, profileData) {
    return this.put(`${this.baseURL}/api/profile/${userId}`, profileData);
  }

  async deleteProfile(userId) {
    return this.delete(`${this.baseURL}/api/profile/${userId}`);
  }

  // Policy API methods
  async uploadPolicy(formData) {
    // Get auth headers for FormData upload
    const authHeaders = await this.getAuthHeaders();
    return this.request(`${this.baseURL}/api/policy`, {
      method: 'POST',
      headers: {
        'Authorization': authHeaders.Authorization
        // Let browser set Content-Type for FormData
      },
      body: formData
    });
  }

  async getPolicies(userId) {
    return this.get(`${this.baseURL}/api/policy?user_id=${encodeURIComponent(userId)}`);
  }

  async getPolicyByHash(fileHash) {
    return this.get(`${this.baseURL}/api/policy?file_hash=${encodeURIComponent(fileHash)}`);
  }

  async getPolicy(policyId) {
    return this.get(`${this.baseURL}/api/policy/${policyId}`);
  }

  async deletePolicy(policyId) {
    return this.delete(`${this.baseURL}/api/policy/${policyId}`);
  }

  async startChatSession({ userId, policyId, mode }) {
    return this.post(`${this.baseURL}/api/policy/session`, { userId, policyId, mode });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
