import { type DaySchedule, type TimeSlot } from "./use-availability-data"

const generateId = (): string => Math.random().toString(36).substring(2, 10)

const DEFAULT_TIME_SLOT = { startTime: "10:00", endTime: "17:00" }

export const useTimeSlotManagement = (
  schedule: DaySchedule[],
  setSchedule: (schedule: DaySchedule[]) => void
) => {
  /**
   * Update day enabled/disabled status
   */
  const updateDayEnabled = (dayIndex: number, enabled: boolean) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].enabled = enabled
    
    if (!enabled) {
      // Clear slots when disabling a day
      newSchedule[dayIndex].slots = []
    } else if (newSchedule[dayIndex].slots.length === 0) {
      // Add default slot when enabling a day
      newSchedule[dayIndex].slots = [{ 
        id: generateId(), 
        ...DEFAULT_TIME_SLOT 
      }]
    }
    
    setSchedule(newSchedule)
  }

  /**
   * Add a new time slot to a day
   */
  const addTimeSlot = (dayIndex: number) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots.push({
      id: generateId(),
      ...DEFAULT_TIME_SLOT,
    })
    setSchedule(newSchedule)
  }

  /**
   * Remove a time slot from a day
   */
  const removeTimeSlot = (dayIndex: number, slotId: string) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots = newSchedule[dayIndex].slots.filter(
      (slot) => slot.id !== slotId
    )
    setSchedule(newSchedule)
  }

  /**
   * Update a time slot's start or end time
   */
  const updateTimeSlot = (
    dayIndex: number, 
    slotId: string, 
    field: "startTime" | "endTime", 
    value: string
  ) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots = newSchedule[dayIndex].slots.map((slot) =>
      slot.id === slotId ? { ...slot, [field]: value } : slot
    )
    setSchedule(newSchedule)
  }

  /**
   * Check if a time slot is valid (end time is after start time)
   */
  const isValidTimeSlot = (startTime: string, endTime: string): boolean => {
    return startTime < endTime
  }

  return {
    updateDayEnabled,
    addTimeSlot,
    removeTimeSlot,
    updateTimeSlot,
    isValidTimeSlot,
  }
}
