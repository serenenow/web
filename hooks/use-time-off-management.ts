import { useState } from "react"
import { type TimeSlot, type TimeOffEntry } from "./use-availability-data"

const generateId = (): string => Math.random().toString(36).substring(2, 10)

const DEFAULT_TIME_SLOT = { startTime: "10:00", endTime: "17:00" }

export const useTimeOffManagement = () => {
  const [showTimeOffForm, setShowTimeOffForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [isFullDayOff, setIsFullDayOff] = useState(true)
  const [customTimeSlots, setCustomTimeSlots] = useState<TimeSlot[]>([])

  /**
   * Add a custom time slot for time off entry
   */
  const addCustomTimeSlot = () => {
    setCustomTimeSlots([
      ...customTimeSlots,
      {
        id: generateId(),
        ...DEFAULT_TIME_SLOT,
      },
    ])
  }

  /**
   * Remove a custom time slot
   */
  const removeCustomTimeSlot = (slotId: string) => {
    setCustomTimeSlots(customTimeSlots.filter((slot) => slot.id !== slotId))
  }

  /**
   * Update a custom time slot
   */
  const updateCustomTimeSlot = (
    slotId: string, 
    field: "startTime" | "endTime", 
    value: string
  ) => {
    setCustomTimeSlots(customTimeSlots.map((slot) => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ))
  }

  /**
   * Check if a time slot is valid (end time is after start time)
   */
  const isValidTimeSlot = (startTime: string, endTime: string): boolean => {
    return startTime < endTime
  }

  /**
   * Create a new time off entry from form data
   */
  const createTimeOffEntry = (): TimeOffEntry => {
    return {
      id: generateId(),
      date: selectedDate,
      isFullDayOff,
      customSlots: isFullDayOff ? [] : [...customTimeSlots],
    }
  }

  /**
   * Reset the time off form
   */
  const resetForm = () => {
    setShowTimeOffForm(false)
    setSelectedDate("")
    setIsFullDayOff(true)
    setCustomTimeSlots([])
  }

  /**
   * Open the time off form
   */
  const openForm = () => {
    setShowTimeOffForm(true)
  }

  return {
    // Form state
    showTimeOffForm,
    selectedDate,
    isFullDayOff,
    customTimeSlots,
    
    // Form setters
    setSelectedDate,
    setIsFullDayOff,
    
    // Custom slot management
    addCustomTimeSlot,
    removeCustomTimeSlot,
    updateCustomTimeSlot,
    
    // Utilities
    isValidTimeSlot,
    createTimeOffEntry,
    resetForm,
    openForm,
  }
}
