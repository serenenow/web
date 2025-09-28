import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateTimeOptions } from "@/lib/utils/time-utils"
import { type TimeSlot } from "@/hooks/use-availability-data"

interface TimeOffFormProps {
  selectedDate: string
  isFullDayOff: boolean
  customTimeSlots: TimeSlot[]
  isSubmitting: boolean
  onDateChange: (date: string) => void
  onFullDayOffChange: (isFullDay: boolean) => void
  onAddCustomTimeSlot: () => void
  onRemoveCustomTimeSlot: (slotId: string) => void
  onUpdateCustomTimeSlot: (slotId: string, field: "startTime" | "endTime", value: string) => void
  onSubmit: () => void
  onCancel: () => void
  onIsValidTimeSlot: (startTime: string, endTime: string) => boolean
}

export const TimeOffForm = ({
  selectedDate,
  isFullDayOff,
  customTimeSlots,
  isSubmitting,
  onDateChange,
  onFullDayOffChange,
  onAddCustomTimeSlot,
  onRemoveCustomTimeSlot,
  onUpdateCustomTimeSlot,
  onSubmit,
  onCancel,
  onIsValidTimeSlot,
}: TimeOffFormProps) => {
  const timeOptions = generateTimeOptions()

  return (
    <div className="mb-6 p-4 bg-mint/5 rounded-lg border border-mint/20">
      <h3 className="font-semibold text-charcoal mb-4">Add Time Off or Custom Availability</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-mint/20 rounded-md focus:border-mint-dark focus:ring-mint-dark"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="fullDayOff"
              checked={isFullDayOff}
              onChange={() => onFullDayOffChange(true)}
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
              onChange={() => onFullDayOffChange(false)}
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
                onClick={onAddCustomTimeSlot}
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
                  onValueChange={(value) => onUpdateCustomTimeSlot(slot.id, "startTime", value)}
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
                  onValueChange={(value) => onUpdateCustomTimeSlot(slot.id, "endTime", value)}
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

                {!onIsValidTimeSlot(slot.startTime, slot.endTime) && (
                  <span className="text-red-500 text-sm">Start time must be before end time</span>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveCustomTimeSlot(slot.id)}
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
            onClick={onSubmit}
            disabled={!selectedDate || isSubmitting}
            className="bg-mint-dark hover:bg-mint-dark/90 text-white"
          >
            {isSubmitting ? "Adding..." : "Add Entry"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-mint/30 hover:bg-mint/10 bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
