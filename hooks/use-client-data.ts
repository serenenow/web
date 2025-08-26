import { useState, useEffect } from "react"
import { 
  getClientData, 
  getClientAuthToken, 
  setClientResponse, 
  type ClientDto, 
  type ClientResponse 
} from "@/lib/api/client-auth"

export interface UseClientDataReturn {
  clientData: ClientDto | null
  isLoading: boolean
  error: Error | null
  isAuthenticated: boolean
  authToken: string | null
  setClientResponseData: (response: ClientResponse) => void
}

/**
 * Custom hook to manage client data from local storage
 * Provides centralized access to client data throughout the application
 */
export function useClientData(): UseClientDataReturn {
  const [clientData, setClientData] = useState<ClientDto | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      // Get client data from localStorage
      const data = getClientData()
      const token = getClientAuthToken()
      
      setClientData(data)
      setAuthToken(token)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load client data"))
      logger.error("Error loading client data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setClientResponseData = (response: ClientResponse) => {
    // Store in localStorage
    setClientResponse(response)
    
    // Update state
    setClientData(response.client)
    setAuthToken(response.accessToken)
  }

  return {
    clientData,
    isLoading,
    error,
    isAuthenticated: !!authToken,
    authToken,
    setClientResponseData
  }
}
