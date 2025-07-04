// Base API configuration and utilities
export const API_ENVIRONMENTS = {
  LOCAL: 'http://localhost:3001/serenenow/api',
  PROD: 'https://kmp-production.up.railway.app/serenenow/api'
};

export type ApiEnvironment = keyof typeof API_ENVIRONMENTS;

// Default to what's in environment variables, fall back to PROD
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || API_ENVIRONMENTS.PROD;

// Helper to get API URL for a specific environment
export const getApiUrl = (environment?: ApiEnvironment): string => {
  if (environment) {
    return API_ENVIRONMENTS[environment];
  }
  return API_BASE_URL;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  debug = process.env.NEXT_PUBLIC_API_DEBUG === 'true'
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  if (debug) {
    console.log(`🔶 API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) console.log(`Request Body: ${options.body}`);
  }

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (debug) {
      console.log(`🔷 API Response: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`)
    }

    const data = await response.json();
    
    if (debug) {
      console.log('Response Data:', data);
    }
    
    return data
  } catch (error) {
    if (debug) {
      console.error('API Error:', error);
    }
    if (error instanceof ApiError) throw error
    throw new Error("Network error occurred")
  }
}
