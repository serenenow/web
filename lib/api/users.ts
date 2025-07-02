// User profile related API calls
import { apiRequest } from "./base"
import { getAuthToken, removeAuthToken } from "./auth"

interface ProfileData {
  firstName: string
  lastName: string
  phone: string
  rciNumber?: string
  specialization?: string
  bio?: string
  yearsOfExperience: number
  qualification: string
  gender: string
  languages: string[]
  age: number
  timezone: string
}

interface CreateProfileResponse {
  success: boolean
  data?: {
    id: string
    email: string
    profile: ProfileData
  }
  error?: string
}

export async function createUserProfile(profileData: ProfileData): Promise<CreateProfileResponse> {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error("No authentication token found")
    }

    return await apiRequest<CreateProfileResponse>("/users/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })
  } catch (error: any) {
    if (error.status === 401) {
      removeAuthToken()
      throw new Error("Session expired. Please login again.")
    }
    throw error
  }
}

export async function getUserProfile(): Promise<any> {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error("No authentication token found")
    }

    return await apiRequest("/users/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error: any) {
    if (error.status === 401) {
      removeAuthToken()
      throw new Error("Session expired. Please login again.")
    }
    throw error
  }
}

export async function updateUserProfile(profileData: Partial<ProfileData>): Promise<any> {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error("No authentication token found")
    }

    return await apiRequest("/users/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })
  } catch (error: any) {
    if (error.status === 401) {
      removeAuthToken()
      throw new Error("Session expired. Please login again.")
    }
    throw error
  }
}
