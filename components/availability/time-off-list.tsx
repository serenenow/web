import { Calendar, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatTime12Hour } from "@/lib/utils/time-utils"
import { type TimeOffEntry } from "@/hooks/use-availability-data"
import { TimeOffForm } from "./time-off-form"

interface TimeOffListProps {
  timeOffEntries: TimeOffEntry[]
  showTimeOffForm: boolean
  selectedDate: string
  isFullDayOff: boolean
  customTimeSlots: any[]
  isSubmitting: boolean
  onOpenForm: () => void
  onRemoveTimeOffEntry: (entryId: string) => Promise<void>
  onDateChange: (date: string) => void
  onFullDayOffChange: (isFullDay: boolean) => void
  onAddCustomTimeSlot: () => void
  onRemoveCustomTimeSlot: (slotId: string) => void
  onUpdateCustomTimeSlot: (slotId: string, field: "startTime" | "endTime", value: string) => void
  onSubmitTimeOff: () => void
  onCancelTimeOff: () => void
  onIsValidTimeSlot: (startTime: string, endTime: string) => boolean
}

export const TimeOffList = ({
  timeOffEntries,
  showTimeOffForm,
  selectedDate,
  isFullDayOff,
  customTimeSlots,
  isSubmitting,
  onOpenForm,
  onRemoveTimeOffEntry,
  onDateChange,
  onFullDayOffChange,
  onAddCustomTimeSlot,
  onRemoveCustomTimeSlot,
  onUpdateCustomTimeSlot,
  onSubmitTimeOff,
  onCancelTimeOff,
  onIsValidTimeSlot,
}: TimeOffListProps) => {
  return (
    <Card className="border-mint/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-charcoal">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-mint-dark" />
            Time Off & Custom Availability
          </div>
          <Button
            onClick={onOpenForm}
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
          <TimeOffForm
            selectedDate={selectedDate}
            isFullDayOff={isFullDayOff}
            customTimeSlots={customTimeSlots}
            isSubmitting={isSubmitting}
            onDateChange={onDateChange}
            onFullDayOffChange={onFullDayOffChange}
            onAddCustomTimeSlot={onAddCustomTimeSlot}
            onRemoveCustomTimeSlot={onRemoveCustomTimeSlot}
            onUpdateCustomTimeSlot={onUpdateCustomTimeSlot}
            onSubmit={onSubmitTimeOff}
            onCancel={onCancelTimeOff}
            onIsValidTimeSlot={onIsValidTimeSlot}
          />
        )}

        {/* Time Off Entries */}
        <div className="space-y-3">
          {timeOffEntries.length === 0 ? (
            <p className="text-charcoal/60 text-center py-8">
              No time off or custom availability entries yet
            </p>
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
                      : `Custom availability: ${entry.customSlots
                          .map((slot) => `${formatTime12Hour(slot.startTime)}-${formatTime12Hour(slot.endTime)}`)
                          .join(", ")}`}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await onRemoveTimeOffEntry(entry.id)
                    } catch (error) {
                      console.error("Failed to remove time-off entry:", error)
                      // You could add toast notification here if needed
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
