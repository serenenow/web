import { useState, useEffect } from "react"
import { type AvailabilityDto, getExpertAvailability, updateExpertAvailability } from "@/lib/api/availability"
import { getExpertData } from "@/lib/api/auth"
import { convertTimeToTimezone, convertTimeToUTC, getBrowserTimezone } from "@/lib/utils/time-utils"
import { logger } from "@/lib/utils/logger"

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

export interface DaySchedule {
  day: string
  enabled: boolean
  slots: TimeSlot[]
}

export interface TimeOffEntry {
  id: string
  date: string
  isFullDayOff: boolean
  customSlots: TimeSlot[]
}

interface ExpertData {
  name: string
  email: string
  id: string
}

const INITIAL_SCHEDULE: DaySchedule[] = [
  { day: "Monday", enabled: true, slots: [] as TimeSlot[] },
  { day: "Tuesday", enabled: true, slots: [] as TimeSlot[] },
  { day: "Wednesday", enabled: true, slots: [] as TimeSlot[] },
  { day: "Thursday", enabled: true, slots: [] as TimeSlot[] },
  { day: "Friday", enabled: true, slots: [] as TimeSlot[] },
  { day: "Saturday", enabled: false, slots: [] as TimeSlot[] },
  { day: "Sunday", enabled: false, slots: [] as TimeSlot[] },
]

const generateId = (): string => Math.random().toString(36).substring(2, 10)

/**
 * Process availability data from API into UI format
 */
const processAvailabilityData = (
  availabilityData: AvailabilityDto[], 
  timezone: string
): { schedule: DaySchedule[], timeOffEntries: TimeOffEntry[] } => {
  const weeklyAvailabilities = availabilityData.filter((a) => a.isRecurring)
  const customAvailabilities = availabilityData.filter((a) => !a.isRecurring)

  // Process weekly schedule
  const newSchedule = INITIAL_SCHEDULE.map(day => ({ ...day, slots: [] as TimeSlot[], enabled: false }))

  // Group weekly availabilities by day of week
  const weeklyByDay = new Map<number, AvailabilityDto[]>()
  weeklyAvailabilities.forEach((avail) => {
    const dayOfWeek = avail.dayOfWeek
    if (!weeklyByDay.has(dayOfWeek)) {
      weeklyByDay.set(dayOfWeek, [])
    }
    weeklyByDay.get(dayOfWeek)?.push(avail)
  })

  // Update schedule with API data
  weeklyByDay.forEach((availabilities, dayOfWeek) => {
    const dayIndex = dayOfWeek - 1 // Convert from 1-7 (Mon-Sun) to 0-6 (Mon-Sun)
    if (dayIndex >= 0 && dayIndex < 7) {
      const isUnavailable = availabilities.some((a) => a.isUnavailable)
      newSchedule[dayIndex].enabled = !isUnavailable

      if (!isUnavailable) {
        newSchedule[dayIndex].slots = availabilities.map((avail) => ({
          id: avail.id || generateId(),
          startTime: convertTimeToTimezone(avail.startTime, timezone),
          endTime: convertTimeToTimezone(avail.endTime, timezone),
        }))
      }
    }
  })

  // Process custom/time off entries
  const timeOffByDate = new Map<string, AvailabilityDto[]>()
  customAvailabilities.forEach((avail) => {
    const date = avail.startTime.substring(0, 10) // Extract date part (YYYY-MM-DD)
    if (!timeOffByDate.has(date)) {
      timeOffByDate.set(date, [])
    }
    timeOffByDate.get(date)?.push(avail)
  })

  // Convert to TimeOffEntry array
  const timeOffEntries: TimeOffEntry[] = []
  timeOffByDate.forEach((availabilities, date) => {
    const isFullDayOff = availabilities.some((a) => a.isUnavailable)

    if (isFullDayOff) {
      timeOffEntries.push({
        id: availabilities[0].id || generateId(),
        date,
        isFullDayOff: true,
        customSlots: [],
      })
    } else {
      timeOffEntries.push({
        id: generateId(),
        date,
        isFullDayOff: false,
        customSlots: availabilities.map((avail) => ({
          id: avail.id || generateId(),
          startTime: convertTimeToTimezone(avail.startTime, timezone),
          endTime: convertTimeToTimezone(avail.endTime, timezone),
        })),
      })
    }
  })

  return { schedule: newSchedule, timeOffEntries }
}

/**
 * Convert UI data to API format for sending to server
 */
const convertToApiFormat = (
  schedule: DaySchedule[], 
  timeOffEntries: TimeOffEntry[],
  timezone: string
): AvailabilityDto[] => {
  // Use current date in the user's timezone for recurring schedules
  const currentDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format in local timezone
  
  // Convert weekly schedule to API format
  const weeklyAvailabilities = schedule.flatMap<AvailabilityDto>((daySchedule, index) => {
    if (!daySchedule.enabled) {
      // For disabled days, send a single entry marking the day as unavailable
      return [{
        id: null,
        dayOfWeek: index + 1, // Convert 0-6 to 1-7
        isRecurring: true,
        isUnavailable: true,
        startTime: `${currentDate}T00:00:00`,
        endTime: `${currentDate}T23:59:00`,
      }]
    }

    // For enabled days with slots, convert each slot to UTC
    return daySchedule.slots.map((slot) => ({
      id: slot.id !== (index + 1).toString() ? slot.id : null,
      dayOfWeek: index + 1,
      isRecurring: true,
      isUnavailable: false,
      startTime: convertTimeToUTC(slot.startTime, currentDate, timezone),
      endTime: convertTimeToUTC(slot.endTime, currentDate, timezone),
    }))
  })

  // Convert time off entries to API format
  const timeOffAvailabilities = timeOffEntries.flatMap<AvailabilityDto>((entry) => {
    // Parse date in local timezone to avoid timezone shift issues
    const localDate = new Date(entry.date + 'T12:00:00')
    
    if (entry.isFullDayOff) {
      return [{
        id: entry.id || null,
        dayOfWeek: localDate.getDay() || 7,
        isRecurring: false,
        isUnavailable: true,
        startTime: `${entry.date}T00:00:00`,
        endTime: `${entry.date}T23:59:59`,
      }]
    } else {
      return entry.customSlots.map((slot) => ({
        id: slot.id || null,
        dayOfWeek: localDate.getDay() || 7,
        isRecurring: false,
        isUnavailable: false,
        startTime: `${entry.date}T${slot.startTime}:00`,
        endTime: `${entry.date}T${slot.endTime}:00`,
      }))
    }
  })

  return [...weeklyAvailabilities, ...timeOffAvailabilities]
}

export const useAvailabilityData = () => {
  const [user, setUser] = useState<ExpertData>({ name: "", email: "", id: "" })
  const [expertId, setExpertId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [timezone, setTimezone] = useState("")
  
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE)
  const [originalSchedule, setOriginalSchedule] = useState<DaySchedule[]>([])
  const [hasScheduleChanges, setHasScheduleChanges] = useState(false)
  
  const [timeOffEntries, setTimeOffEntries] = useState<TimeOffEntry[]>([])

  // Initialize expert data and timezone
  useEffect(() => {
    const expertData = getExpertData()
    if (expertData) {
      setUser({
        name: expertData.name || "",
        email: expertData.email || "",
        id: expertData.id || "",
      })
      
      const userTimezone = expertData.timeZone || getBrowserTimezone()
      setTimezone(userTimezone)

      if (expertData.id) {
        setExpertId(expertData.id)
        fetchAvailability(expertData.id, userTimezone)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  // Track schedule changes
  useEffect(() => {
    if (originalSchedule.length > 0) {
      const hasChanges = JSON.stringify(schedule) !== JSON.stringify(originalSchedule)
      setHasScheduleChanges(hasChanges)
    }
  }, [schedule, originalSchedule])

  // Refetch availability when timezone changes
  useEffect(() => {
    if (expertId && timezone) {
      fetchAvailability(expertId, timezone)
    }
  }, [timezone])

  const fetchAvailability = async (id: string, tz: string) => {
    if (!id) return

    try {
      setIsLoading(true)
      const availabilityData = await getExpertAvailability(id)
      const { schedule: newSchedule, timeOffEntries: newTimeOffEntries } = 
        processAvailabilityData(availabilityData, tz)
      
      setSchedule(newSchedule)
      setOriginalSchedule(JSON.parse(JSON.stringify(newSchedule)))
      setTimeOffEntries(newTimeOffEntries)
    } catch (error) {
      logger.error("Error fetching availability data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvailability = async (availabilities: AvailabilityDto[]) => {
    const currentExpertId = expertId || getExpertData()?.id
    if (!currentExpertId) {
      throw new Error("Expert ID not found. Please log in again.")
    }

    setIsSubmitting(true)
    try {
      // Update availability and get the latest data from server
      const updatedAvailabilities = await updateExpertAvailability(currentExpertId, { availabilities })
      
      // Process the server response to update local state
      if (updatedAvailabilities && Array.isArray(updatedAvailabilities)) {
        const { schedule: newSchedule, timeOffEntries: newTimeOffEntries } = 
          processAvailabilityData(updatedAvailabilities, timezone)
        
        setSchedule(newSchedule)
        setOriginalSchedule(JSON.parse(JSON.stringify(newSchedule)))
        setTimeOffEntries(newTimeOffEntries)
        setHasScheduleChanges(false)
      } else {
        // Fallback: just update the original schedule reference
        setOriginalSchedule(JSON.parse(JSON.stringify(schedule)))
        setHasScheduleChanges(false)
      }
      
      logger.info("Availability updated successfully!")
    } catch (error) {
      logger.error("Failed to update availability:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveSchedule = async () => {
    const weeklyAvailabilities = convertToApiFormat(schedule, timeOffEntries, timezone)
      .filter((a) => a.isRecurring)
    await updateAvailability(weeklyAvailabilities)
  }


  const addTimeOffEntry = async (entry: TimeOffEntry) => {
    const newAvailabilities: AvailabilityDto[] = []

    if (entry.isFullDayOff) {
      // Parse date in local timezone to avoid timezone shift issues
      const localDate = new Date(entry.date + 'T12:00:00')
      newAvailabilities.push({
        id: null,
        dayOfWeek: localDate.getDay() || 7,
        isRecurring: false,
        isUnavailable: true,
        startTime: `${entry.date}T00:00:00`,
        endTime: `${entry.date}T23:59:00`,
      })
    } else {
      entry.customSlots.forEach((slot) => {
        // Parse date in local timezone to avoid timezone shift issues
        const localDate = new Date(entry.date + 'T12:00:00')
        newAvailabilities.push({
          id: null,
          dayOfWeek: localDate.getDay() || 7,
          isRecurring: false,
          isUnavailable: false,
          startTime: convertTimeToUTC(slot.startTime, entry.date, timezone),
          endTime: convertTimeToUTC(slot.endTime, entry.date, timezone),
        })
      })
    }

    const allAvailabilities = convertToApiFormat(schedule, timeOffEntries, timezone)
    await updateAvailability([...allAvailabilities, ...newAvailabilities])
    // Note: timeOffEntries will be updated automatically from server response in updateAvailability
  }

  const removeTimeOffEntry = async (entryId: string) => {
    try {
      // Filter out the entry to be removed
      const updatedTimeOffEntries = timeOffEntries.filter((entry) => entry.id !== entryId)
      
      // Convert all data (schedule + remaining time-off entries) to API format
      const allAvailabilities = convertToApiFormat(schedule, updatedTimeOffEntries, timezone)
      
      // Send updated data to server (this will exclude the deleted entry)
      await updateAvailability(allAvailabilities)
      
      logger.info("Time-off entry removed successfully!")
    } catch (error) {
      logger.error("Failed to remove time-off entry:", error)
      throw error
    }
  }

  return {
    // State
    user,
    expertId,
    isLoading,
    isSubmitting,
    timezone,
    schedule,
    hasScheduleChanges,
    timeOffEntries,
    
    // Actions
    setTimezone,
    setSchedule,
    saveSchedule,
    addTimeOffEntry,
    removeTimeOffEntry,
    generateId,
  }
}
