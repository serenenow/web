// Base API configuration and utilities
import { addCSRFToken } from "@/lib/utils/csrf-protection"
import { logger } from "@/lib/utils/logger"
import { processApiResponse, handleFetchError, ApiResponse } from "@/lib/utils/api-response"
import { STORAGE_KEYS } from "@/lib/utils/secure-storage"

/**
 * Converts a camelCase string to snake_case
 * @param str The camelCase string to convert
 * @returns The snake_case version of the string
 */
export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converts a snake_case string to camelCase
 * @param str The snake_case string to convert
 * @returns The camelCase version of the string
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/(_[a-z])/g, group => group.replace('_', '').toUpperCase());
}

/**
 * Recursively converts all keys in an object from camelCase to snake_case
 * @param obj The object to convert
 * @returns A new object with all keys converted to snake_case
 */
export function convertKeysToSnakeCase(obj: any): any {
  // Handle null or non-object values
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays by mapping each item
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item));
  }

  // Handle regular objects
  return Object.keys(obj).reduce((result: any, key: string) => {
    const snakeKey = camelToSnakeCase(key);
    const value = obj[key];
    
    result[snakeKey] = typeof value === 'object' && value !== null
      ? convertKeysToSnakeCase(value)
      : value;
      
    return result;
  }, {});
}

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 * @param obj The object to convert
 * @returns A new object with all keys converted to camelCase
 */
export function convertKeysToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item));
  }

  return Object.keys(obj).reduce((result: any, key: string) => {
    const camelKey = snakeToCamelCase(key);
    const value = obj[key];
    
    result[camelKey] = typeof value === 'object' && value !== null
      ? convertKeysToCamelCase(value)
      : value;
      
    return result;
  }, {});
}

export const API_ENVIRONMENTS = {
  LOCAL: "http://localhost:8080/serenenow/api/v1",
  PROD: "/api/proxy", // Use Next.js API proxy to handle cross-origin cookies
}

export type ApiEnvironment = keyof typeof API_ENVIRONMENTS

// Default to what's in environment variables, fall back to PROD
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || API_ENVIRONMENTS.PROD
const API_DEBUG = process.env.NEXT_PUBLIC_API_DEBUG === "true"

// Helper to get API URL for a specific environment
export const getApiUrl = (environment?: ApiEnvironment): string => {
  if (environment) {
    return API_ENVIRONMENTS[environment]
  }
  return API_BASE_URL
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class CSRFError extends Error {
  constructor(message: string = "Please refresh the page and try again.") {
    super(message)
    this.name = "CSRFError"
  }
}

/**
 * Make an API request with standardized error handling and response processing
 * @param endpoint API endpoint path (will be appended to API_BASE_URL)
 * @param options Fetch request options
 * @returns Processed API response data converted to camelCase
 */
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Log API request in debug mode
  if (API_DEBUG) {
    logger.debug(`API Request: ${url}`);
  }
  
  // Security check: Warn about non-HTTPS URLs in production
  // Relative URLs are secure when served over HTTPS, so only check absolute URLs
  if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
    logger.error('Security warning: Using non-HTTPS URL in production:', url)
  }

  // Default headers
  const headers = new Headers(options.headers || {})
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  
  // Add authentication token if available
  if (typeof window !== 'undefined') {
    // Check for expert auth token (stored directly in localStorage)
    const expertAuthToken = localStorage.getItem(STORAGE_KEYS.EXPERT_AUTH_TOKEN);
    
    // Check for client auth token (also in localStorage)
    const clientAuthToken = localStorage.getItem(STORAGE_KEYS.CLIENT_AUTH_TOKEN);
    
    // Add the appropriate token to Authorization header
    const token = clientAuthToken || expertAuthToken;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
      if (API_DEBUG) {
        logger.debug('Added authentication token to request');
      }
    }
  }
  
  // Add CSRF token to headers for non-GET requests
  if (options.method && options.method !== "GET") {
    try {
      await addCSRFToken(headers)
      
      if (API_DEBUG) {
        logger.debug('Added CSRF token to request headers')
      }
    } catch (error) {
      logger.error('Failed to add CSRF token:', error)
      throw new CSRFError('Failed to get CSRF token. Please refresh the page and try again.')
    }
  }

  // Merge default options with provided options
  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Include cookies for cross-origin requests
  }

  if (API_DEBUG) {
    logger.debug(`API Request: ${options.method || "GET"} ${url}`)
    logger.debug("Request Headers:", Object.fromEntries([...headers.entries()]))
    
    // Debug cookies being sent
    if (typeof window !== 'undefined') {
      logger.debug("Document cookies:", document.cookie)
      logger.debug("Credentials mode:", config.credentials)
    }
    
    if (options.body) {
      logger.debug("Request Body:", options.body)
    }
  }

  try {
    // Convert request body from camelCase to snake_case if it's JSON
    if (config.body && typeof config.body === "string" && headers.get("Content-Type")?.includes("application/json")) {
      try {
        const bodyObj = JSON.parse(config.body)
        const snakeCaseBody = convertKeysToSnakeCase(bodyObj)
        config.body = JSON.stringify(snakeCaseBody)
        
        if (API_DEBUG) {
          logger.debug('Converted Request Body:', config.body);
        }
      } catch (e) {
        // If parsing fails, leave the body as is
        logger.warn('Could not convert request body to snake_case:', e);
      }
    }
    
    // Make the API request
    const response = await fetch(url, config)
    
    // Use centralized API response processing
    const apiResponse = await processApiResponse<T>(response);
    
    if (API_DEBUG) {
      logger.debug(`Response Status: ${apiResponse.status} ${response.statusText}`)
      logger.debug("Response Success:", apiResponse.success)
      if (apiResponse.error) {
        logger.debug("Response Error:", apiResponse.error)
      }
    }
    
    // If the response was not successful, throw an error
    if (!apiResponse.success) {
      throw new Error(apiResponse.error?.message || `HTTP ${apiResponse.status}: ${response.statusText}`)
    }
    
    // If there's no data, return an empty object
    if (!apiResponse.data) {
      return {} as T
    }
    
    // Convert response data from snake_case to camelCase
    const camelCaseData = convertKeysToCamelCase(apiResponse.data)
    
    if (API_DEBUG) {
      logger.debug("Response Data (Original):", apiResponse.data)
      logger.debug("Response Data (CamelCase):", camelCaseData)
    }
    
    return camelCaseData
  } catch (error) {
    // Use centralized fetch error handling
    const errorResponse = handleFetchError(error);
    
    if (API_DEBUG) {
      logger.error("API Error:", errorResponse.error)
    }
    
    throw new Error(errorResponse.error?.message || "An unknown error occurred")
  }
}
