// src/lib/utils/apiThrottle.ts

/**
 * A utility for tracking and throttling API calls globally using localStorage
 * This ensures we don't make excessive calls across component re-renders
 */

const LINKEDIN_STATUS_KEY = 'linkedin_status_last_check';
const API_CALL_PREFIX = 'api_call_';

/**
 * Checks if enough time has passed since the last call to a specific API
 * 
 * @param apiKey Unique identifier for the API
 * @param minInterval Minimum time in ms between calls (default: 60000ms = 1 minute)
 * @returns Boolean indicating if the call should proceed
 */
export function shouldMakeApiCall(apiKey: string, minInterval: number = 60000): boolean {
  try {
    const storageKey = `${API_CALL_PREFIX}${apiKey}`;
    const lastCallTime = localStorage.getItem(storageKey);
    
    if (!lastCallTime) {
      // First time, allow the call
      return true;
    }
    
    const now = Date.now();
    const timeSinceLastCall = now - parseInt(lastCallTime, 10);
    
    return timeSinceLastCall > minInterval;
  } catch (error) {
    // If localStorage fails, allow the call
    console.error('Error checking API throttle:', error);
    return true;
  }
}

/**
 * Records that an API call was made
 * 
 * @param apiKey Unique identifier for the API
 */
export function recordApiCall(apiKey: string): void {
  try {
    const storageKey = `${API_CALL_PREFIX}${apiKey}`;
    localStorage.setItem(storageKey, Date.now().toString());
  } catch (error) {
    console.error('Error recording API call:', error);
  }
}

/**
 * Specifically for LinkedIn status checks
 */
export function shouldCheckLinkedInStatus(): boolean {
  return shouldMakeApiCall(LINKEDIN_STATUS_KEY, 60000); // Once per minute
}

export function recordLinkedInStatusCheck(): void {
  recordApiCall(LINKEDIN_STATUS_KEY);
}

/**
 * Reset tracking for testing purposes
 */
export function resetApiTracking(apiKey?: string): void {
  try {
    if (apiKey) {
      localStorage.removeItem(`${API_CALL_PREFIX}${apiKey}`);
    } else {
      // Clear all API tracking items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(API_CALL_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error resetting API tracking:', error);
  }
}