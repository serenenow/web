"use client"

import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TimezoneSelector } from "@/components/availability/timezone-selector"
import { WeeklySchedule } from "@/components/availability/weekly-schedule"
import { TimeOffList } from "@/components/availability/time-off-list"
import { useAvailabilityData } from "@/hooks/use-availability-data"
import { useTimeSlotManagement } from "@/hooks/use-time-slot-management"
import { useTimeOffManagement } from "@/hooks/use-time-off-management"
import { logger } from "@/lib/utils/logger"

export default function AvailabilityPage() {
  // Main availability data hook
  const {
    user,
    isLoading,
    isSubmitting,
    timezone,
    schedule,
    hasScheduleChanges,
    timeOffEntries,
    setTimezone,
    setSchedule,
    saveSchedule,
    addTimeOffEntry,
    removeTimeOffEntry,
  } = useAvailabilityData()

  // Time slot management hook
  const {
    updateDayEnabled,
    addTimeSlot,
    removeTimeSlot,
    updateTimeSlot,
    isValidTimeSlot,
  } = useTimeSlotManagement(schedule, setSchedule)

  // Time off management hook
  const {
    showTimeOffForm,
    selectedDate,
    isFullDayOff,
    customTimeSlots,
    setSelectedDate,
    setIsFullDayOff,
    addCustomTimeSlot,
    removeCustomTimeSlot,
    updateCustomTimeSlot,
    isValidTimeSlot: isValidCustomTimeSlot,
    createTimeOffEntry,
    resetForm,
    openForm,
  } = useTimeOffManagement()

  /**
   * Handle adding a new time off entry
   */
  const handleAddTimeOff = async () => {
    if (!selectedDate) return

    try {
      const newEntry = createTimeOffEntry()
      await addTimeOffEntry(newEntry)
      resetForm()
      logger.info("Time off entry added successfully!")
    } catch (error) {
      logger.error("Failed to add time off entry:", error)
    }
  }

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal mb-2">Availability</h1>
            <p className="text-charcoal/70">Set your working hours and availability</p>
          </div>

          {/* Timezone Selection */}
          <TimezoneSelector timezone={timezone} onTimezoneChange={setTimezone} />

          {/* Weekly Schedule */}
          <WeeklySchedule
            schedule={schedule}
            hasScheduleChanges={hasScheduleChanges}
            isSubmitting={isSubmitting}
            onUpdateSchedule={saveSchedule}
            onUpdateDayEnabled={updateDayEnabled}
            onAddTimeSlot={addTimeSlot}
            onRemoveTimeSlot={removeTimeSlot}
            onUpdateTimeSlot={updateTimeSlot}
            onIsValidTimeSlot={isValidTimeSlot}
          />

          {/* Time Off Section */}
          <TimeOffList
            timeOffEntries={timeOffEntries}
            showTimeOffForm={showTimeOffForm}
            selectedDate={selectedDate}
            isFullDayOff={isFullDayOff}
            customTimeSlots={customTimeSlots}
            isSubmitting={isSubmitting}
            onOpenForm={openForm}
            onRemoveTimeOffEntry={removeTimeOffEntry}
            onDateChange={setSelectedDate}
            onFullDayOffChange={setIsFullDayOff}
            onAddCustomTimeSlot={addCustomTimeSlot}
            onRemoveCustomTimeSlot={removeCustomTimeSlot}
            onUpdateCustomTimeSlot={updateCustomTimeSlot}
            onSubmitTimeOff={handleAddTimeOff}
            onCancelTimeOff={resetForm}
            onIsValidTimeSlot={isValidCustomTimeSlot}
          />
        </div>
      </main>
    </div>
  )
}
