"use client"

import { useState } from "react"
import { Clock, Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function AvailabilityPage() {
  const [user] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
  })

  const [schedule, setSchedule] = useState([
    { day: "Monday", enabled: true, startTime: "10:00", endTime: "17:00" },
    { day: "Tuesday", enabled: true, startTime: "10:00", endTime: "17:00" },
    { day: "Wednesday", enabled: true, startTime: "10:00", endTime: "17:00" },
    { day: "Thursday", enabled: true, startTime: "10:00", endTime: "17:00" },
    { day: "Friday", enabled: true, startTime: "10:00", endTime: "17:00" },
    { day: "Saturday", enabled: false, startTime: "10:00", endTime: "17:00" },
    { day: "Sunday", enabled: false, startTime: "10:00", endTime: "17:00" },
  ])

  const [timezone, setTimezone] = useState("Asia/Kolkata")

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return { value: `${hour}:00`, label: `${hour}:00` }
  })

  const timezones = [
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Berlin", label: "Central European Time (CET)" },
  ]

  const updateSchedule = (index: number, field: string, value: any) => {
    const newSchedule = [...schedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setSchedule(newSchedule)
  }

  const handleSave = () => {
    // Save schedule logic here
    console.log("Saving schedule:", { schedule, timezone })
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
            <Button onClick={handleSave} className="bg-mint-dark hover:bg-mint-dark/90 text-white">
              Save Changes
            </Button>
          </div>

          {/* Timezone Selection */}
          <Card className="border-mint/20 mb-6">
            <CardHeader>
              <CardTitle className="text-charcoal">Timezone</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card className="border-mint/20">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Clock className="h-5 w-5 mr-2 text-mint-dark" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.map((day, index) => (
                  <div key={day.day} className="flex items-center space-x-4 p-4 bg-mint/5 rounded-lg">
                    <div className="w-24">
                      <span className="font-medium text-charcoal">{day.day}</span>
                    </div>

                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) => updateSchedule(index, "enabled", checked)}
                    />

                    {day.enabled ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Select
                          value={day.startTime}
                          onValueChange={(value) => updateSchedule(index, "startTime", value)}
                        >
                          <SelectTrigger className="w-32 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
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

                        <Select value={day.endTime} onValueChange={(value) => updateSchedule(index, "endTime", value)}>
                          <SelectTrigger className="w-32 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
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
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="text-charcoal/40">Unavailable</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-mint/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-mint-dark" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">Add Break</h3>
                <p className="text-sm text-charcoal/60 mb-3">Schedule lunch or other breaks</p>
                <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                  Add Break
                </Button>
              </CardContent>
            </Card>

            <Card className="border-mint/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-mint-dark" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">Time Off</h3>
                <p className="text-sm text-charcoal/60 mb-3">Block dates for vacation or holidays</p>
                <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                  Add Time Off
                </Button>
              </CardContent>
            </Card>

            <Card className="border-mint/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Edit className="h-6 w-6 text-mint-dark" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">Buffer Time</h3>
                <p className="text-sm text-charcoal/60 mb-3">Add buffer between appointments</p>
                <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                  Set Buffer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
