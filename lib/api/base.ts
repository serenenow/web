// Base API configuration and utilities

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
  LOCAL: "http://localhost:8080/serenenow/api",
  PROD: "http://localhost:8080/serenenow/api",
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

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  if (API_DEBUG) {
    console.log(`API Request: ${options.method || "GET"} ${url}`)
    if (options.body) {
      console.log("Request Body:", options.body)
    }
    console.log("Request Headers:", options.headers)
  }

  // Create headers object
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }
  
  // Add authorization token for non-auth endpoints
  if (!endpoint.includes("/auth/")) {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    headers,
    ...options,
  }

  try {
    // Convert request body from camelCase to snake_case if it exists
    if (config.body && typeof config.body === 'string') {
      try {
        const bodyObj = JSON.parse(config.body);
        const snakeCaseBody = convertKeysToSnakeCase(bodyObj);
        config.body = JSON.stringify(snakeCaseBody);
        
        if (API_DEBUG) {
          console.log('Converted Request Body:', config.body);
        }
      } catch (e) {
        // If parsing fails, leave the body as is
        console.warn('Could not convert request body to snake_case:', e);
      }
    }
    
    const response = await fetch(url, config)

    if (API_DEBUG) {
      console.log(`Response Status: ${response.status} ${response.statusText}`)
      console.log("Response Headers:", Object.fromEntries([...response.headers.entries()]))
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        // If we can't parse the error response, use the default message
      }

      throw new Error(errorMessage)
    }

    // Handle empty responses (like 204 No Content)
    const contentType = response.headers.get("content-type")
    console.log("Content type: "+ contentType)
    
    // If we get HTML when expecting JSON, it might be an error page
    if (contentType && contentType.includes("text/html")) {
      console.warn("Received HTML response when expecting JSON. This might indicate an error.")
      const textResponse = await response.text()
      console.log("HTML Response Preview:", textResponse.substring(0, 200) + "...")
      // Continue processing as if empty response
      return {} as T
    }
    
    if (!contentType || !contentType.includes("application/json")) {
      console.log("Non-JSON content type, returning empty object")
      return {} as T
    }

    const data = await response.json()

    // Convert response data from snake_case to camelCase
    const camelCaseData = convertKeysToCamelCase(data)

    if (API_DEBUG) {
      console.log("Response Data (Original):", data)
      console.log("Response Data (CamelCase):", camelCaseData)
    }

    return camelCaseData
  } catch (error) {
    if (API_DEBUG) {
      console.error("API Error:", error)
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error occurred. Please check your connection and try again.")
    }

    throw error
  }
}
