/**
 * CSRF Protection Utility
 * 
 * This utility provides CSRF protection for API requests by:
 * 1. Fetching a CSRF token from the server
 * 2. Storing it in secure storage
 * 3. Adding it to API requests as a header
 * 4. Working with server-side validation of the token
 */

import { secureSessionStorage } from "./secure-storage";
import { logger } from "./logger";

// Import API URL helper
import { getApiUrl } from "@/lib/api/base";

// Constants
const CSRF_TOKEN_KEY = "serenenow_csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const CSRF_TOKEN_ENDPOINT = `${getApiUrl()}/csrf-token`;

/**
 * Fetch a CSRF token from the server
 * @returns Promise that resolves to the CSRF token
 */
async function fetchCSRFToken(): Promise<string> {
  try {
    // Use relative URL to ensure it uses the same base URL as the API
    const response = await fetch(CSRF_TOKEN_ENDPOINT, {
      method: "GET",
      credentials: "include", // Include cookies for session authentication
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.token) {
      throw new Error("CSRF token not found in server response");
    }
    
    return data.token;
  } catch (error) {
    logger.error("Error fetching CSRF token:", error);
    // Fall back to a locally generated token in case of error
    // This is not ideal but allows the app to continue functioning
    return generateLocalFallbackToken();
  }
}

/**
 * Generate a local fallback token when server fetch fails
 * @returns A locally generated token
 */
function generateLocalFallbackToken(): string {
  // Use crypto API for secure random token generation
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(32); // 256 bits
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without crypto API
  logger.warn("Crypto API not available, using less secure fallback for CSRF token");
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

/**
 * Get the current CSRF token or fetch a new one from the server if none exists
 * @returns The current CSRF token
 */
export async function getCSRFToken(): Promise<string> {
  const storage = secureSessionStorage;
  let token = storage.getItem(CSRF_TOKEN_KEY) as string | null;
  
  if (!token) {
    token = await fetchCSRFToken();
    storage.setItem(CSRF_TOKEN_KEY, token);
  }
  
  return token;
}

/**
 * Get the current CSRF token synchronously (from storage only)
 * @returns The current CSRF token or null if not available
 */
export function getStoredCSRFToken(): string | null {
  return secureSessionStorage.getItem(CSRF_TOKEN_KEY);
}

/**
 * Add CSRF token to request headers
 * @param headers Headers object or Record<string, string>
 * @returns Promise that resolves to updated headers with CSRF token
 */
export async function addCSRFToken(headers: Headers | Record<string, string>): Promise<Headers | Record<string, string>> {
  // Only add token in browser environment
  if (typeof window !== "undefined") {
    try {
      // Get token asynchronously - this will fetch from server if not available
      const token = await getCSRFToken();
      
      // Handle Headers object
      if (headers instanceof Headers) {
        headers.set(CSRF_HEADER_NAME, token);
        return headers;
      }
      
      // Handle plain object
      return {
        ...headers,
        [CSRF_HEADER_NAME]: token
      };
    } catch (error) {
      logger.error('Failed to add CSRF token to headers:', error);
      throw error; // Re-throw to let caller handle
    }
  }
  return headers;
}

/**
 * Initialize CSRF protection by fetching a token from the server
 * This should be called during app initialization
 */
export async function initializeCSRFProtection(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      // This will fetch a new token if one doesn't exist
      await getCSRFToken();
      logger.debug("CSRF protection initialized");
    } catch (error) {
      logger.error("Failed to initialize CSRF protection:", error);
    }
  }
}

/**
 * Validate CSRF token against the stored token
 * Note: This is primarily for client-side validation.
 * Server-side validation is the primary security mechanism.
 */
export function validateCSRFToken(token: string): boolean {
  if (typeof window === "undefined") {
    return false; // Cannot validate on server-side with this implementation
  }
  
  const storage = secureSessionStorage;
  const storedToken = storage.getItem(CSRF_TOKEN_KEY);
  
  return !!storedToken && storedToken === token;
}
