import { useState, useEffect } from "react"
import { getExpertData } from "@/lib/api/auth"

export interface ExpertData {
  id: string
  name: string
  email: string
}

/**
 * Custom hook to manage expert data from local storage
 * Provides centralized access to expert data throughout the application
 */
export function useExpertData() {
  const [expertData, setExpertData] = useState<ExpertData>({
    id: "",
    name: "",
    email: "",
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      const data = getExpertData()
      if (data) {
        setExpertData({
          id: data.id || "",
          name: data.name || "",
          email: data.email || "",
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load expert data"))
      console.error("Error loading expert data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    expertData,
    isLoading,
    error,
    isAuthenticated: !!expertData.id,
  }
}
