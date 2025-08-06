"use client"

import { useState, useEffect } from "react"
import { Clock, Plus, Calendar, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { type AvailabilityDto, getExpertAvailability, updateExpertAvailability } from "@/lib/api/availability"
import { getExpertData } from "@/lib/api/auth"
import { format, parseISO } from "date-fns"
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz"
import { logger } from "@/lib/utils/logger"
import { formatDate } from "@/lib/utils/time-utils"
import { 
  convertTimeToTimezone, 
  convertTimeToUTC, 
  formatTime12Hour, 
  generateTimeOptions, 
  timezones,
  legacyTimezones,
  getBrowserTimezone,
  getTimezoneDisplayWithOffset,
  getTimezonesGroupedByRegion,
  TimeZoneInfo
} from "@/lib/utils/time-utils"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

interface DaySchedule {
  day: string
  enabled: boolean
  slots: TimeSlot[]
}

interface TimeOffEntry {
  id: string
  date: string
  isFullDayOff: boolean
  customSlots: TimeSlot[]
}

export default function AvailabilityPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    id: "", // Expert ID for API calls
  })

  const [expertId, setExpertId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: "Monday", enabled: true, slots: [{ id: "1", startTime: "10:00", endTime: "17:00" }] },
    { day: "Tuesday", enabled: true, slots: [{ id: "2", startTime: "10:00", endTime: "17:00" }] },
    { day: "Wednesday", enabled: true, slots: [{ id: "3", startTime: "10:00", endTime: "17:00" }] },
    { day: "Thursday", enabled: true, slots: [{ id: "4", startTime: "10:00", endTime: "17:00" }] },
    { day: "Friday", enabled: true, slots: [{ id: "5", startTime: "10:00", endTime: "17:00" }] },
    { day: "Saturday", enabled: false, slots: [] },
    { day: "Sunday", enabled: false, slots: [] },
  ])

  const [originalSchedule, setOriginalSchedule] = useState<DaySchedule[]>([])
  const [hasScheduleChanges, setHasScheduleChanges] = useState(false)
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [timeOffEntries, setTimeOffEntries] = useState<TimeOffEntry[]>([])
  const [showTimeOffForm, setShowTimeOffForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [isFullDayOff, setIsFullDayOff] = useState(true)
  const [customTimeSlots, setCustomTimeSlots] = useState<TimeSlot[]>([])

  // Use the time utilities from our centralized module
  const timeOptions = generateTimeOptions()

  // Get expert data from local storage and fetch availability data
  useEffect(() => {
    // Load expert data from local storage
    const expertData = getExpertData()
    if (expertData) {
      setUser({
        name: expertData.name || "",
        email: expertData.email || "",
        id: expertData.id || "",
      })
      
      // Set timezone from expert data if available
      if (expertData.timeZone) {
        setTimezone(expertData.timeZone)
      }
      
      if (expertData.id) {
        setExpertId(expertData.id)
        fetchAvailability(expertData.id)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchAvailability = async (id: string) => {
    if (!id) return

    try {
      setIsLoading(true)
      const availabilityData = await getExpertAvailability(id)
      processAvailabilityData(availabilityData)
      setIsLoading(false)
    } catch (error) {
      logger.error("Error fetching availability data:", error)
      setIsLoading(false)
    }
  }

  // Process availability data from API into UI format
  const processAvailabilityData = (availabilityData: AvailabilityDto[]) => {
    // Split into recurring (weekly) and non-recurring (custom) availabilities
    const weeklyAvailabilities = availabilityData.filter((a) => a.isRecurring)
    const customAvailabilities = availabilityData.filter((a) => !a.isRecurring)

    // Process weekly schedule
    const newSchedule = [...schedule]

    // Reset all slots
    newSchedule.forEach((day, index) => {
      newSchedule[index].slots = []
      newSchedule[index].enabled = false
    })

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
      // Convert from 1-7 (Mon-Sun) to 0-6 (Mon-Sun)
      const dayIndex = dayOfWeek - 1
      if (dayIndex >= 0 && dayIndex < 7) {
        // Check if day is unavailable
        const isUnavailable = availabilities.some((a) => a.isUnavailable)
        newSchedule[dayIndex].enabled = !isUnavailable

        // If not unavailable, add time slots
        if (!isUnavailable) {
          newSchedule[dayIndex].slots = availabilities.map((avail) => ({
            id: avail.id || generateId(),
            startTime: convertTimeToTimezone(avail.startTime, timezone),
            endTime: convertTimeToTimezone(avail.endTime, timezone),
          }))
        }
      }
    })

    setSchedule(newSchedule)
    setOriginalSchedule(JSON.parse(JSON.stringify(newSchedule)))

    // Process custom/time off entries
    const timeOffByDate = new Map<string, AvailabilityDto[]>()
    customAvailabilities.forEach((avail) => {
      // Extract date part from ISO string (YYYY-MM-DD)
      const date = avail.startTime.substring(0, 10)
      if (!timeOffByDate.has(date)) {
        timeOffByDate.set(date, [])
      }
      timeOffByDate.get(date)?.push(avail)
    })

    // Convert to TimeOffEntry array
    const newTimeOffEntries: TimeOffEntry[] = []
    timeOffByDate.forEach((availabilities, date) => {
      // Check if this is a full day off
      const isFullDayOff = availabilities.some((a) => a.isUnavailable)

      if (isFullDayOff) {
        newTimeOffEntries.push({
          id: availabilities[0].id || generateId(),
          date,
          isFullDayOff: true,
          customSlots: [],
        })
      } else {
        newTimeOffEntries.push({
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

    setTimeOffEntries(newTimeOffEntries)
  }

  // Initialize original schedule on component mount
  useEffect(() => {
    if (!isLoading && schedule.length > 0) {
      setOriginalSchedule(JSON.parse(JSON.stringify(schedule)))
    }
  }, [isLoading])

  // Check for changes in schedule
  useEffect(() => {
    if (originalSchedule.length > 0) {
      const hasChanges = JSON.stringify(schedule) !== JSON.stringify(originalSchedule)
      setHasScheduleChanges(hasChanges)
    }
  }, [schedule, originalSchedule])
  
  // Update time slots when timezone changes
  useEffect(() => {
    if (!isLoading && expertId) {
      // Refetch availability data when timezone changes
      fetchAvailability(expertId)
    }
  }, [timezone])

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10)
  }

  // Update day enabled/disabled status
  const updateDayEnabled = (dayIndex: number, enabled: boolean) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].enabled = enabled
    if (!enabled) {
      // Clear slots when disabling a day
      newSchedule[dayIndex].slots = []
    } else if (newSchedule[dayIndex].slots.length === 0) {
      // Add default slot when enabling a day
      newSchedule[dayIndex].slots = [{ id: generateId(), startTime: "10:00", endTime: "17:00" }]
    }
    setSchedule(newSchedule)
  }

  // Add a new time slot to a day
  const addTimeSlot = (dayIndex: number) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots.push({
      id: generateId(),
      startTime: "10:00",
      endTime: "17:00",
    })
    setSchedule(newSchedule)
  }

  // Remove a time slot from a day
  const removeTimeSlot = (dayIndex: number, slotId: string) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots = newSchedule[dayIndex].slots.filter((slot) => slot.id !== slotId)
    setSchedule(newSchedule)
  }

  // Update a time slot's start or end time
  const updateTimeSlot = (dayIndex: number, slotId: string, field: "startTime" | "endTime", value: string) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots = newSchedule[dayIndex].slots.map((slot) =>
      slot.id === slotId ? { ...slot, [field]: value } : slot,
    )
    setSchedule(newSchedule)
  }

  // Check if a time slot is valid (end time is after start time)
  const isValidTimeSlot = (startTime: string, endTime: string) => {
    return startTime < endTime
  }

  // Add a custom time slot for time off entry
  const addCustomTimeSlot = () => {
    setCustomTimeSlots([
      ...customTimeSlots,
      {
        id: generateId(),
        startTime: "10:00",
        endTime: "17:00",
      },
    ])
  }

  // Remove a custom time slot
  const removeCustomTimeSlot = (slotId: string) => {
    setCustomTimeSlots(customTimeSlots.filter((slot) => slot.id !== slotId))
  }

  // Update a custom time slot
  const updateCustomTimeSlot = (slotId: string, field: "startTime" | "endTime", value: string) => {
    setCustomTimeSlots(customTimeSlots.map((slot) => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ))
  }

  // Add a new time off entry
  const handleAddTimeOff = async () => {
    if (!selectedDate) return
    
    // Get expert ID from state or local storage if not already set
    let currentExpertId = expertId
    if (!currentExpertId) {
      const expertData = getExpertData()
      currentExpertId = expertData?.id || ""
      
      // Update expertId state if we got data from local storage
      if (currentExpertId) {
        setExpertId(currentExpertId)
      }
    }
    
    if (!currentExpertId) {
      alert("Expert ID not found. Please log in again.")
      return
    }

    const newEntry: TimeOffEntry = {
      id: generateId(),
      date: selectedDate,
      isFullDayOff,
      customSlots: isFullDayOff ? [] : [...customTimeSlots],
    }

    setIsSubmitting(true)

    try {
      // Create availability entries for this time off
      const newAvailabilities: AvailabilityDto[] = []

      if (isFullDayOff) {
        // Full day off
        newAvailabilities.push({
          id: undefined,
          dayOfWeek: new Date(selectedDate).getDay() || 7,
          isRecurring: false,
          isUnavailable: true,
          startTime: convertTimeToUTC(`00:00`, selectedDate, timezone),
          endTime: convertTimeToUTC(`23:59`, selectedDate, timezone),
        })
      } else {
        // Custom availability slots
        customTimeSlots.forEach((slot) => {
          newAvailabilities.push({
            id: undefined,
            dayOfWeek: new Date(selectedDate).getDay() || 7,
            isRecurring: false,
            isUnavailable: false,
            startTime: convertTimeToUTC(slot.startTime, selectedDate, timezone),
            endTime: convertTimeToUTC(slot.endTime, selectedDate, timezone),
          })
        })
      }

      // Get all existing availabilities and add the new ones
      const allAvailabilities = convertToApiFormat()

      // Make API call to update availability with all data
      await updateExpertAvailability(currentExpertId, {
        availabilities: [...allAvailabilities, ...newAvailabilities],
      })

      // Add to local state after successful API call
      setTimeOffEntries([...timeOffEntries, newEntry])

      logger.info("Time off entry added successfully!")
    } catch (error) {
      logger.error("Failed to add time off entry:", error)
    } finally {
      setIsSubmitting(false)

      // Reset form
      setShowTimeOffForm(false)
      setSelectedDate("")
      setIsFullDayOff(true)
      setCustomTimeSlots([])
    }
  }

  // Remove a time off entry
  const removeTimeOffEntry = (entryId: string) => {
    setTimeOffEntries(timeOffEntries.filter((entry) => entry.id !== entryId))
  }

  // Convert UI data to API format for sending to server
  const convertToApiFormat = (): AvailabilityDto[] => {
    // Convert weekly schedule to API format
    const weeklyAvailabilities = schedule.flatMap<AvailabilityDto>((daySchedule, index) => {
      // Skip days that are not enabled (unavailable)
      if (!daySchedule.enabled) {
        // For disabled days, send a single entry marking the day as unavailable
        return [
          {
            id: null,
            dayOfWeek: index + 1, // Convert 0-6 to 1-7
            isRecurring: true,
            isUnavailable: true,
            // Use a default time range for unavailable days
            startTime: `2000-01-01T00:00:00`,
            endTime: `2000-01-01T23:59:59`,
          },
        ]
      }

      // For enabled days with slots, convert each slot
      return daySchedule.slots.map((slot) => ({
        id: slot.id !== (index + 1).toString() ? slot.id : null, // Don't send default IDs
        dayOfWeek: index + 1, // Convert 0-6 to 1-7
        isRecurring: true,
        isUnavailable: false,
        startTime: `2000-01-01T${slot.startTime}:00`,
        endTime: `2000-01-01T${slot.endTime}:00`,
      }))
    })

    // Convert time off entries to API format
    const timeOffAvailabilities = timeOffEntries.flatMap<AvailabilityDto>((entry) => {
      if (entry.isFullDayOff) {
        // Full day off is represented as a single unavailable entry
        return [
          {
            id: entry.id || null,
            dayOfWeek: new Date(entry.date).getDay() || 7, // Convert JS day (0-6, Sun-Sat) to our format (1-7, Mon-Sun)
            isRecurring: false,
            isUnavailable: true,
            startTime: `${entry.date}T00:00:00`,
            endTime: `${entry.date}T23:59:59`,
          },
        ]
      } else {
        // Custom availability is represented as multiple available slots
        return entry.customSlots.map((slot) => ({
          id: slot.id || null,
          dayOfWeek: new Date(entry.date).getDay() || 7,
          isRecurring: false,
          isUnavailable: false,
          startTime: `${entry.date}T${slot.startTime}:00`,
          endTime: `${entry.date}T${slot.endTime}:00`,
        }))
      }
    })

    // Combine both types of availabilities
    return [...weeklyAvailabilities, ...timeOffAvailabilities]
  }

  // Update weekly schedule
  const handleUpdateSchedule = async () => {
    // Try to get expert ID from state or local storage if not available
    let currentExpertId = expertId
    if (!currentExpertId) {
      const expertData = getExpertData()
      currentExpertId = expertData?.id || ""
      
      // Update expertId state if we got data from local storage
      if (currentExpertId) {
        setExpertId(currentExpertId)
      }
    }
    
    if (!currentExpertId) {
      alert("Expert ID not found. Please log in again.")
      return
    }

    setIsSubmitting(true)

    try {
      // Get all availabilities in API format
      const availabilities = convertToApiFormat()

      // Send only the weekly schedule part for now
      const weeklyAvailabilities = availabilities.filter((a) => a.isRecurring)

      // Make API call to update availability
      await updateExpertAvailability(currentExpertId, {
        availabilities: weeklyAvailabilities,
      })

      // Update original schedule to match current schedule
      setOriginalSchedule(JSON.parse(JSON.stringify(schedule)))
      setHasScheduleChanges(false)

      // Show success message
      logger.info("Schedule updated successfully!")
    } catch (error) {
      logger.error("Failed to update schedule:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save all availability settings
  const handleSave = async () => {
    // Try to get expert ID from state or localStorage if not available
    let currentExpertId = expertId
    if (!currentExpertId && typeof window !== 'undefined') {
      currentExpertId = localStorage.getItem("expert_id") || ""
      if (currentExpertId) {
        setExpertId(currentExpertId)
      }
    }
    
    if (!currentExpertId) {
      logger.error("Expert ID not available")
      return
    }

    setIsSubmitting(true)

    try {
      // Get all availabilities in API format
      const allAvailabilities = convertToApiFormat()

      // Make API call to update all availability data
      await updateExpertAvailability(currentExpertId, {
        availabilities: allAvailabilities,
      })

      // Update original schedule to match current schedule
      setOriginalSchedule(JSON.parse(JSON.stringify(schedule)))
      setHasScheduleChanges(false)

      logger.info("All availability settings saved successfully!")
    } catch (error) {
      logger.error("Failed to save availability settings:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Using centralized formatDate function from time-utils.ts

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-charcoal">Loading availability...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">Availability</h1>
              <p className="text-charcoal/70">Set your working hours and availability</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-mint-dark hover:bg-mint-dark/90 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Timezone Selection */}
          <Card className="border-mint/20 mb-6">
            <CardHeader>
              <CardTitle className="text-charcoal">Timezone</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timezone} onValueChange={(newTimezone) => {
                setTimezone(newTimezone);
                // When timezone changes, we'll refetch availability data in the useEffect
              }}>
                <SelectTrigger className="w-full border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                  <SelectValue placeholder="Select your timezone">
                    {getTimezoneDisplayWithOffset(timezone)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(getTimezonesGroupedByRegion()).map(([region, tzList]) => (
                    <div key={region}>
                      <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">{region}</div>
                      {tzList.map((tz) => (
                        <SelectItem key={tz.id} value={tz.id}>
                          {tz.displayName} {tz.offset ? `(UTC${tz.offset})` : ''}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card className="border-mint/20 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-charcoal">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-mint-dark" />
                  Weekly Schedule
                </div>
                {hasScheduleChanges && (
                  <Button
                    onClick={handleUpdateSchedule}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isSubmitting ? "Updating..." : "Update Schedule"}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {schedule.map((daySchedule, dayIndex) => (
                  <div key={daySchedule.day} className="p-4 bg-mint/5 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-24">
                          <span className="font-medium text-charcoal">{daySchedule.day}</span>
                        </div>
                        <Switch
                          checked={daySchedule.enabled}
                          onCheckedChange={(checked) => updateDayEnabled(dayIndex, checked)}
                        />
                      </div>
                      {daySchedule.enabled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addTimeSlot(dayIndex)}
                          className="border-mint/30 hover:bg-mint/10 bg-transparent"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Slot
                        </Button>
                      )}
                    </div>

                    {daySchedule.enabled ? (
                      <div className="space-y-3">
                        {daySchedule.slots.map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-2">
                            <Select
                              value={slot.startTime}
                              onValueChange={(value) => updateTimeSlot(dayIndex, slot.id, "startTime", value)}
                            >
                              <SelectTrigger className="w-40 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <span className="text-charcoal/60">to</span>

                            <Select
                              value={slot.endTime}
                              onValueChange={(value) => updateTimeSlot(dayIndex, slot.id, "endTime", value)}
                            >
                              <SelectTrigger className="w-40 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {!isValidTimeSlot(slot.startTime, slot.endTime) && (
                              <span className="text-red-500 text-sm">Start time must be before end time</span>
                            )}

                            {daySchedule.slots.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTimeSlot(dayIndex, slot.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-charcoal/40">Unavailable</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Off Section */}
          <Card className="border-mint/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-charcoal">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-mint-dark" />
                  Time Off & Custom Availability
                </div>
                <Button
                  onClick={() => setShowTimeOffForm(true)}
                  size="sm"
                  className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time Off
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Time Off Form */}
              {showTimeOffForm && (
                <div className="mb-6 p-4 bg-mint/5 rounded-lg border border-mint/20">
                  <h3 className="font-semibold text-charcoal mb-4">Add Time Off or Custom Availability</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-mint/20 rounded-md focus:border-mint-dark focus:ring-mint-dark"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="fullDayOff"
                          checked={isFullDayOff}
                          onChange={() => setIsFullDayOff(true)}
                          className="text-mint-dark focus:ring-mint-dark"
                        />
                        <label htmlFor="fullDayOff" className="text-sm text-charcoal">
                          Full Day Off
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="customAvailability"
                          checked={!isFullDayOff}
                          onChange={() => setIsFullDayOff(false)}
                          className="text-mint-dark focus:ring-mint-dark"
                        />
                        <label htmlFor="customAvailability" className="text-sm text-charcoal">
                          Custom Availability
                        </label>
                      </div>
                    </div>

                    {!isFullDayOff && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-charcoal">Available Time Slots</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addCustomTimeSlot}
                            className="border-mint/30 hover:bg-mint/10 bg-transparent"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Slot
                          </Button>
                        </div>

                        {customTimeSlots.map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-2">
                            <Select
                              value={slot.startTime}
                              onValueChange={(value) => updateCustomTimeSlot(slot.id, "startTime", value)}
                            >
                              <SelectTrigger className="w-40 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <span className="text-charcoal/60">to</span>

                            <Select
                              value={slot.endTime}
                              onValueChange={(value) => updateCustomTimeSlot(slot.id, "endTime", value)}
                            >
                              <SelectTrigger className="w-40 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {!isValidTimeSlot(slot.startTime, slot.endTime) && (
                              <span className="text-red-500 text-sm">Start time must be before end time</span>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCustomTimeSlot(slot.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {customTimeSlots.length === 0 && (
                          <p className="text-sm text-charcoal/60">
                            Add time slots for when you'll be available on this date
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddTimeOff}
                        disabled={!selectedDate || isSubmitting}
                        className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                      >
                        {isSubmitting ? "Adding..." : "Add Entry"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowTimeOffForm(false)
                          setSelectedDate("")
                          setIsFullDayOff(true)
                          setCustomTimeSlots([])
                        }}
                        className="border-mint/30 hover:bg-mint/10 bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Off Entries */}
              <div className="space-y-3">
                {timeOffEntries.length === 0 ? (
                  <p className="text-charcoal/60 text-center py-8">No time off or custom availability entries yet</p>
                ) : (
                  timeOffEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-mint/20"
                    >
                      <div>
                        <div className="font-medium text-charcoal">{formatDate(entry.date)}</div>
                        <div className="text-sm text-charcoal/60">
                          {entry.isFullDayOff
                            ? "Full day off"
                            : `Custom availability: ${entry.customSlots.map((slot) => `${formatTime12Hour(slot.startTime)}-${formatTime12Hour(slot.endTime)}`).join(", ")}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTimeOffEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
