/**
 * Server-Sent Events (SSE) Client Utility
 * Uses fetch with ReadableStream to support custom headers (unlike EventSource)
 */

import { supabase } from './supabaseClient';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Subscribe to SSE events for policy notifications
 * @param {string} policyId - The policy ID to subscribe to
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onMessage - Called when a message event is received
 * @param {Function} callbacks.onError - Called when an error occurs
 * @param {Function} callbacks.onOpen - Called when connection opens
 * @param {Function} callbacks.onClose - Called when connection closes
 * @returns {Function} Cleanup function to close the connection
 */
export async function subscribeToPolicyNotifications(policyId, callbacks = {}) {
  const { onMessage, onError, onOpen, onClose } = callbacks;

  try {
    // Get authentication token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const url = API_ENDPOINTS.POLICY.NOTIFICATIONS(policyId);

    // Use fetch with ReadableStream to support custom headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Call onOpen callback
    if (onOpen) {
      onOpen();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Read stream
    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (onClose) {
              onClose();
            }
            break;
          }

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue;

            // Skip heartbeat comments
            if (line.startsWith(':')) continue;

            // Parse SSE format: "data: {...}"
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6); // Remove "data: " prefix

              try {
                const data = JSON.parse(dataStr);

                // Call onMessage callback
                if (onMessage) {
                  onMessage(data);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError, dataStr);
              }
            }
          }
        }
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          console.error('SSE read error:', error);
        }
      }
    };

    // Start reading
    readStream();

    // Return cleanup function
    return () => {
      try {
        reader.cancel();
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.warn('Error closing SSE connection:', error);
      }
    };

  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      console.error('SSE subscription error:', error);
    }

    // Return no-op cleanup function
    return () => {};
  }
}
