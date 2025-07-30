// User profile related API calls
import { apiRequest } from "./base"

interface AddressDto {
  userId?: string
  street: string
  city: string
  state: string
  stateCode: string // 2-character state code for GST (e.g., "MH" for Maharashtra)
  country: string
  pincode: string
}

interface WebExpertRegisterRequest {
  name: string
  email: string
  timeZone: string
  phoneNumber: string
  yearsOfExperience: number
  qualification: string
  description: string
  gender: string
  pictureUrl: string
  languages: string
  rciNumber: string
  age: number
  address: AddressDto
}

export interface ExpertDto {
  id: string
  email: string
  name: string
  qualification: string
  pictureUrl: string
  authSource: string
  activationStatus: string
  timeZone: string
  firebaseTokenId?: string
}

export interface ServiceDto {
  id: string
  title: string
  description: string
  price: number
  durationMin: number
  bufferMin: number
  cancellationDeadlineHours: number
  rescheduleDeadlineHours: number
  cancellationPercent: number
}

export interface ClientDto {
  id: string
  name: string
  email: string
  phoneNumber: string
}

// ExpertAppointment interface moved to appointments.ts

export interface ExpertResponse {
  accessToken: string
  hasSetupProfile: boolean
  expert: ExpertDto
}

export interface CreateProfileResponse {
  success: boolean
  data?: ExpertDto
  error?: string
}

export async function createExpertProfile(profileData: {
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
  address: {
    street: string
    city: string
    state: string
    country: string
    pincode: string
  }
}): Promise<CreateProfileResponse> {
  try {
    // Get expert data from localStorage to get id
    const expertData = JSON.parse(localStorage.getItem("expert_data") || "{}")
    
    if (!expertData.id) {
      throw new Error("Expert ID not found in local storage")
    }

    // Map gender values to backend enum
    const genderMapping: { [key: string]: string } = {
      male: "MALE",
      female: "FEMALE",
      "non-binary": "NON_BINARY",
      "prefer-not-to-say": "NOT_SPECIFIED",
    }

    // Create the ExpertUpdateRequest structure
    const requestData = {
      id: expertData.id,
      name: `${profileData.firstName} ${profileData.lastName}`,
      phoneNumber: profileData.phone,
      yearsOfExperience: profileData.yearsOfExperience,
      qualification: profileData.qualification,
      description: profileData.bio || "",
      gender: genderMapping[profileData.gender] || "NOT_SPECIFIED",
      pictureUrl: "", // Will be handled separately if needed
      languages: profileData.languages.join(","),
      rciNumber: profileData.rciNumber || "",
      age: profileData.age,
      address: {
        userId: expertData.id,
        street: profileData.address.street,
        city: profileData.address.city,
        state: profileData.address.state,
        stateCode: "", // Will be empty since we're not using state codes anymore
        country: profileData.address.country,
        pincode: profileData.address.pincode,
      },
      timezone: profileData.timezone
    }

    const response = await apiRequest<ExpertResponse>("/expert/profile", {
      method: "PUT",
      body: JSON.stringify(requestData),
    })
    
    // Store updated expert data in localStorage
    if (response && response.expert) {
      localStorage.setItem('expert_data', JSON.stringify(response.expert))
    }

    return {
      success: true,
      data: response.expert
    }
  } catch (error: any) {
    throw error
  }
}

export async function getUserProfile(): Promise<any> {
  return await apiRequest("/users/profile", {
    method: "GET",
  })
}

export async function updateUserProfile(profileData: any): Promise<any> {
  return await apiRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  })
}
