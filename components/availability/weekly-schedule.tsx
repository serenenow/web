import { Clock, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { generateTimeOptions } from "@/lib/utils/time-utils"
import { type DaySchedule } from "@/hooks/use-availability-data"

interface WeeklyScheduleProps {
  schedule: DaySchedule[]
  hasScheduleChanges: boolean
  isSubmitting: boolean
  onUpdateSchedule: () => void
  onUpdateDayEnabled: (dayIndex: number, enabled: boolean) => void
  onAddTimeSlot: (dayIndex: number) => void
  onRemoveTimeSlot: (dayIndex: number, slotId: string) => void
  onUpdateTimeSlot: (dayIndex: number, slotId: string, field: "startTime" | "endTime", value: string) => void
  onIsValidTimeSlot: (startTime: string, endTime: string) => boolean
}

export const WeeklySchedule = ({
  schedule,
  hasScheduleChanges,
  isSubmitting,
  onUpdateSchedule,
  onUpdateDayEnabled,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onUpdateTimeSlot,
  onIsValidTimeSlot,
}: WeeklyScheduleProps) => {
  const timeOptions = generateTimeOptions()

  return (
    <Card className="border-mint/20 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-charcoal">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-mint-dark" />
            Weekly Schedule
          </div>
          {hasScheduleChanges && (
            <Button
              onClick={onUpdateSchedule}
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
                    onCheckedChange={(checked) => onUpdateDayEnabled(dayIndex, checked)}
                  />
                </div>
                {daySchedule.enabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddTimeSlot(dayIndex)}
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
                        onValueChange={(value) => onUpdateTimeSlot(dayIndex, slot.id, "startTime", value)}
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
                        onValueChange={(value) => onUpdateTimeSlot(dayIndex, slot.id, "endTime", value)}
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

                      {daySchedule.slots.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveTimeSlot(dayIndex, slot.id)}
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
  )
}
