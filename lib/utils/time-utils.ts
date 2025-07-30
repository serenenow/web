import { format, parseISO } from "date-fns"
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz"

/**
 * TimeZone information interface
 */
export interface TimeZoneInfo {
  id: string
  displayName: string
  region: string
  offset?: string
}

/**
 * Prioritized timezone list for the application
 * Organized by region with Asia prioritized
 */
export const timezones: TimeZoneInfo[] = [
  // Asia (prioritized)
  { id: "Asia/Kolkata", displayName: "India", region: "Asia" },
  { id: "Asia/Dubai", displayName: "Dubai", region: "Asia" },
  { id: "Asia/Singapore", displayName: "Singapore", region: "Asia" },
  { id: "Asia/Tokyo", displayName: "Tokyo", region: "Asia" },
  { id: "Asia/Hong_Kong", displayName: "Hong Kong", region: "Asia" },
  { id: "Asia/Shanghai", displayName: "China", region: "Asia" },
  { id: "Asia/Seoul", displayName: "South Korea", region: "Asia" },
  { id: "Asia/Bangkok", displayName: "Thailand", region: "Asia" },
  { id: "Asia/Jakarta", displayName: "Indonesia", region: "Asia" },
  { id: "Asia/Manila", displayName: "Philippines", region: "Asia" },
  { id: "Asia/Kuala_Lumpur", displayName: "Malaysia", region: "Asia" },
  { id: "Asia/Taipei", displayName: "Taiwan", region: "Asia" },
  { id: "Asia/Ho_Chi_Minh", displayName: "Vietnam", region: "Asia" },
  
  // North America
  { id: "America/New_York", displayName: "New York", region: "America" },
  { id: "America/Los_Angeles", displayName: "Los Angeles", region: "America" },
  { id: "America/Chicago", displayName: "Chicago", region: "America" },
  { id: "America/Toronto", displayName: "Toronto", region: "America" },
  { id: "America/Vancouver", displayName: "Vancouver", region: "America" },
  { id: "America/Mexico_City", displayName: "Mexico City", region: "America" },
  
  // Europe
  { id: "Europe/London", displayName: "London", region: "Europe" },
  { id: "Europe/Paris", displayName: "Paris", region: "Europe" },
  { id: "Europe/Berlin", displayName: "Berlin", region: "Europe" },
  { id: "Europe/Madrid", displayName: "Madrid", region: "Europe" },
  { id: "Europe/Rome", displayName: "Rome", region: "Europe" },
  { id: "Europe/Amsterdam", displayName: "Amsterdam", region: "Europe" },
  { id: "Europe/Moscow", displayName: "Moscow", region: "Europe" },
  
  // Australia & Pacific
  { id: "Australia/Sydney", displayName: "Sydney", region: "Australia" },
  { id: "Australia/Melbourne", displayName: "Melbourne", region: "Australia" },
  { id: "Australia/Brisbane", displayName: "Brisbane", region: "Australia" },
  { id: "Pacific/Auckland", displayName: "Auckland", region: "Pacific" },
  
  // Africa & Middle East
  { id: "Africa/Cairo", displayName: "Cairo", region: "Africa" },
  { id: "Africa/Johannesburg", displayName: "Johannesburg", region: "Africa" },
  { id: "Asia/Jerusalem", displayName: "Jerusalem", region: "Asia" },
  { id: "Asia/Riyadh", displayName: "Riyadh", region: "Asia" }
]

/**
 * Legacy timezone format for backward compatibility
 */
export const legacyTimezones = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
]

/**
 * Format time in 12-hour format (e.g., "10:00 AM")
 * @param time24 Time in 24-hour format (e.g., "10:00")
 * @returns Time in 12-hour format
 */
export const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(":")
  const hour = Number.parseInt(hours, 10)
  const period = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${period}`
}

/**
 * Generate time options with 30-minute intervals in 12-hour format
 */
export const generateTimeOptions = () => {
  return Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    const hourStr = hour.toString().padStart(2, "0")
    const time24 = `${hourStr}:${minute}`
    const time12 = formatTime12Hour(time24)
    return { value: time24, label: time12 }
  })
}

/**
 * Convert time from UTC to local timezone
 * @param isoTime ISO time string
 * @param targetTimezone Target timezone
 * @returns Time in HH:mm format in the target timezone
 */
export const convertTimeToTimezone = (isoTime: string, targetTimezone: string): string => {
  try {
    // Format the ISO time string directly to the target timezone
    return formatInTimeZone(parseISO(isoTime), targetTimezone, 'HH:mm')
  } catch (error) {
    console.error('Error converting time:', error)
    // Fallback to extracting time directly from string
    return isoTime.substring(11, 16)
  }
}

/**
 * Convert local time to UTC ISO string without Z suffix
 * @param timeStr Time string in HH:mm format or HH:mm AM/PM format
 * @param dateStr Date string in YYYY-MM-DD format
 * @param sourceTimezone Source timezone
 * @returns ISO string in the format YYYY-MM-DDThh:mm:ss
 */
export const convertTimeToUTC = (timeStr: string, dateStr: string, sourceTimezone: string): string => {
  try {
    // Handle time string with AM/PM format
    let time24h = timeStr
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      // Extract the time part without AM/PM
      const timeParts = timeStr.replace(/\s+/g, ' ').trim().split(' ')
      const [hours, minutes] = timeParts[0].split(':').map(Number)
      const period = timeParts[1]
      
      // Convert to 24-hour format
      let hour24 = hours
      if (period === 'PM' && hours < 12) hour24 += 12
      if (period === 'AM' && hours === 12) hour24 = 0
      
      time24h = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    // Create a date object with the time
    const fullDateTimeStr = `${dateStr}T${time24h}:00`
    const date = parseISO(fullDateTimeStr)
    
    // Get timezone offset in milliseconds
    const tzOffset = getTimezoneOffset(sourceTimezone, date)
    
    // Adjust the date by the timezone offset to get UTC
    const utcDate = new Date(date.getTime() - tzOffset)
    
    // Format to ISO string without Z suffix
    const isoString = utcDate.toISOString()
    return isoString.substring(0, 19) // Remove milliseconds and Z suffix
  } catch (error) {
    console.error('Error converting time to UTC:', error)
    // Fallback without Z suffix
    return `${dateStr}T${timeStr}:00`
  }
}

/**
 * Create a time slot from string with proper ISO format
 * @param timeString Time string in HH:mm format
 * @param dateString Date string in YYYY-MM-DD format
 * @param timezone Timezone to use for conversion
 * @param durationMinutes Duration in minutes
 * @returns Object with startTime and endTime in ISO format
 */
export const createTimeSlotFromString = (
  timeString: string, 
  dateString: string, 
  timezone: string,
  durationMinutes = 60
): { startTime: string; endTime: string } => {
  // Convert the time to UTC ISO format
  const startTime = convertTimeToUTC(timeString, dateString, timezone)
  
  // Calculate end time by adding duration
  const startDate = parseISO(startTime)
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
  const endTime = endDate.toISOString().substring(0, 19) // Remove milliseconds and Z suffix
  
  return { startTime, endTime }
}

/**
 * Format date for display
 * @param dateStr Date string in YYYY-MM-DD format
 * @param formatStr Format string for date-fns
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    return format(parseISO(dateStr), formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateStr
  }
}

/**
 * Get user's browser timezone
 * @returns Timezone string (e.g., "Asia/Kolkata")
 */
export const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.error('Error getting browser timezone:', error)
    return 'Asia/Kolkata' // Default to IST
  }
}

/**
 * Find the closest timezone from our list to the user's browser timezone
 * @returns Timezone object with id and displayName
 */
export const getClosestTimezone = (): TimeZoneInfo => {
  const browserTz = getBrowserTimezone()
  const found = timezones.find(tz => tz.id === browserTz)
  return found || timezones[0] // Default to first timezone if not found
}

/**
 * Get timezone offset string (e.g., "+05:30") for display purposes
 * @param timezoneId Timezone identifier (e.g., "Asia/Kolkata")
 * @returns Formatted offset string (e.g., "+05:30")
 */
export const getTimezoneOffsetString = (timezoneId: string): string => {
  try {
    const now = new Date()
    const tzOffset = getTimezoneOffset(timezoneId, now)
    const offsetMinutes = tzOffset / (60 * 1000)
    
    const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    const minutes = Math.abs(offsetMinutes) % 60
    
    const sign = offsetMinutes >= 0 ? '+' : '-'
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  } catch (error) {
    console.error(`Error getting timezone offset for ${timezoneId}:`, error)
    return ''
  }
}

/**
 * Get timezone display name with offset
 * @param timezoneId Timezone identifier (e.g., "Asia/Kolkata")
 * @returns Formatted display name (e.g., "India (UTC+05:30)")
 */
export const getTimezoneDisplayWithOffset = (timezoneId: string): string => {
  const timezone = timezones.find(tz => tz.id === timezoneId)
  if (!timezone) return timezoneId
  
  const offset = getTimezoneOffsetString(timezoneId)
  return `${timezone.displayName} (UTC${offset})`
}

/**
 * Get timezones grouped by region
 * @returns Object with regions as keys and arrays of timezones as values
 */
export const getTimezonesGroupedByRegion = (): Record<string, TimeZoneInfo[]> => {
  const grouped: Record<string, TimeZoneInfo[]> = {}
  
  timezones.forEach(tz => {
    if (!grouped[tz.region]) {
      grouped[tz.region] = []
    }
    
    // Add offset information for display
    const tzWithOffset = {
      ...tz,
      offset: getTimezoneOffsetString(tz.id)
    }
    
    grouped[tz.region].push(tzWithOffset)
  })
  
  return grouped
}
