/**
 * API Response and Error Handling Utilities
 * Centralizes response processing and error handling for API requests
 */

import { logger } from "./logger";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  status: number;
  success: boolean;
}

/**
 * API Error structure
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Process API response and standardize the return format
 * @param response Fetch Response object
 * @returns Standardized ApiResponse object
 */
export async function processApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type");
  const status = response.status;
  
  // Default response structure
  const apiResponse: ApiResponse<T> = {
    data: null,
    error: null,
    status,
    success: response.ok
  };

  // Handle successful responses
  if (response.ok) {
    // Handle empty responses (like 204 No Content)
    if (!contentType || !contentType.includes("application/json")) {
      return apiResponse;
    }

    try {
      apiResponse.data = await response.json();
      return apiResponse;
    } catch (error) {
      logger.error("Error parsing successful response JSON:", error);
      apiResponse.success = false;
      apiResponse.error = {
        message: "Failed to parse response data"
      };
      return apiResponse;
    }
  }

  // Handle error responses
  try {
    // Try to parse error as JSON
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      
      apiResponse.error = {
        message: errorData.message || errorData.error || `HTTP ${status}: ${response.statusText}`,
        code: errorData.code,
        details: errorData.details || errorData
      };
    } else {
      // Handle non-JSON error responses (like HTML error pages)
      const textResponse = await response.text();
      logger.warn("Received non-JSON error response:", textResponse.substring(0, 200) + "...");
      
      apiResponse.error = {
        message: `HTTP ${status}: ${response.statusText}`,
        details: { responsePreview: textResponse.substring(0, 200) }
      };
    }
  } catch (error) {
    // If we can't parse the error response at all
    logger.error("Error parsing error response:", error);
    apiResponse.error = {
      message: `HTTP ${status}: ${response.statusText}`
    };
  }

  return apiResponse;
}

/**
 * Handle network or other fetch errors
 * @param error The caught error
 * @returns Standardized ApiResponse object for the error
 */
export function handleFetchError(error: any): ApiResponse {
  logger.error("API Fetch Error:", error);
  
  // Initialize with a non-null error object to avoid TypeScript null checks
  const apiResponse: ApiResponse = {
    data: null,
    status: error.status,
    success: false,
    error: {
      message: "Network error occurred. Please check your connection and try again."
    }
  };

  // Provide more specific error messages for common network errors
  if (error instanceof TypeError) {
    if (error.message.includes("fetch")) {
      // We know error is not null here since we initialized it above
      apiResponse.error = {
        message: "Network error occurred. Please check your connection and try again.",
        code: "NETWORK_ERROR"
      };
    } else if (error.message.includes("JSON")) {
      apiResponse.error = {
        message: "Invalid response format received from server.",
        code: "PARSE_ERROR"
      };
    }
  }

  return apiResponse;
}

/**
 * Utility to check if an API response was successful
 * @param response The API response to check
 * @returns True if the response was successful, false otherwise
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== null;
}

/**
 * Extract error message from API response for display
 * @param response The API response
 * @returns A user-friendly error message
 */
export function getErrorMessage(response: ApiResponse): string {
  if (!response.error || !response.error.message) {
    return "An unknown error occurred";
  }
  
  return response.error.message;
}
