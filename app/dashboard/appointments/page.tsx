"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, ExternalLink, Filter, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  fetchUpcomingAppointments,
  approveAppointment,
  declineAppointment,
  type ExpertAppointment,
  fetchAllAppointments,
  type AppointmentLists,
} from "@/lib/api/appointments"
import { getExpertData } from "@/lib/api/auth"
import { format, parseISO } from "date-fns"
import { getBrowserTimezone, convertTimeToTimezone, formatTime12Hour } from "@/lib/utils/time-utils"
import { logger } from "@/lib/utils/logger"
import { AppointmentStatus, type AppointmentFilter } from "@/lib/types/appointment"

export default function AppointmentsPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  })

  const [filter, setFilter] = useState<AppointmentFilter>("upcoming")
  const [appointmentLists, setAppointmentLists] = useState<AppointmentLists>({ upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (appointmentId: string) => {
    try {
      await approveAppointment(appointmentId)
      // Refresh appointments
      const data = await fetchAllAppointments()
      setAppointmentLists(data)
    } catch (error) {
      logger.error("Error approving appointment:", error)
    }
  }

  const handleDecline = async (appointmentId: string) => {
    try {
      await declineAppointment(appointmentId)
      // Refresh appointments
      const data = await fetchAllAppointments()
      setAppointmentLists(data)
    } catch (error) {
      logger.error("Error declining appointment:", error)
    }
  }

  useEffect(() => {
    // Get expert data from local storage
    const expertData = getExpertData()
    if (expertData) {
      setUser({
        name: expertData.name,
        email: expertData.email,
      })
    }

    // Fetch appointments
    const loadAppointments = async () => {
      try {
        setLoading(true)
        const data = await fetchAllAppointments()
        setAppointmentLists(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching appointments:", err)
        setError("Failed to load appointments. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  // Get current appointments based on filter
  const getCurrentAppointments = (): ExpertAppointment[] => {
    switch (filter) {
      case "upcoming":
        return appointmentLists.upcoming
      case "past":
        return appointmentLists.past
      case "all":
        return [...appointmentLists.upcoming, ...appointmentLists.past]
      default:
        return []
    }
  }

  // Format appointment data for display
  const formattedAppointments = getCurrentAppointments().map((appointment) => {
    const startDate = parseISO(appointment.startTime)
    const userTimeZone = getBrowserTimezone()
    
    // Convert time to user's timezone and format as 12-hour
    const localTime = convertTimeToTimezone(appointment.startTime, userTimeZone)
    const formattedTime = formatTime12Hour(localTime)

    return {
      id: appointment.id,
      client: appointment.client.name,
      service: appointment.service.title,
      date: format(startDate, "MMM d, yyyy"),
      time: formattedTime,
      timeZone: userTimeZone,
      status: appointment.status,
      meetingLink: appointment.meetingLink || null,
      notes: appointment.notes || "",
      isUpcoming: appointmentLists.upcoming.some(apt => apt.id === appointment.id),
    }
  })

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return "bg-mint/20 text-mint-dark"
      case AppointmentStatus.NEEDS_APPROVAL:
        return "bg-yellow-100 text-yellow-800"
      case AppointmentStatus.COMPLETED:
        return "bg-green-100 text-green-800"
      case AppointmentStatus.CANCELLED:
        return "bg-red-100 text-red-800"
      case AppointmentStatus.NO_SHOW:
        return "bg-gray-100 text-gray-800"
      case AppointmentStatus.PAYMENT_PENDING:
        return "bg-orange-100 text-orange-800"
      case AppointmentStatus.PAYMENT_FAILED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.NEEDS_APPROVAL:
        return "Needs Approval"
      case AppointmentStatus.PAYMENT_PENDING:
        return "Payment Pending"
      case AppointmentStatus.PAYMENT_FAILED:
        return "Payment Failed"
      case AppointmentStatus.NO_SHOW:
        return "No Show"
      default:
        return status.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">Appointments</h1>
              <p className="text-charcoal/70">Manage your therapy sessions</p>
            </div>
            <Button className="bg-mint-dark hover:bg-mint-dark/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-mint/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Filter className="h-4 w-4 text-charcoal/60" />
                <Select value={filter} onValueChange={(value) => setFilter(value as AppointmentFilter)}>
                  <SelectTrigger className="w-48 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Appointments</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card className="border-mint/20">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-mint-dark animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Loading appointments...</h3>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {!loading && error && (
            <Card className="border-mint/20 border-red-300">
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
                <p className="text-charcoal/60 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Appointments List */}
          {!loading && !error && (
            <div className="grid gap-4">
              {formattedAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-mint/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-charcoal">{appointment.client}</h3>
                          <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-charcoal/60 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {appointment.time} ({appointment.timeZone})
                          </div>
                          <div>Service: {appointment.service}</div>
                        </div>

                        {appointment.notes && (
                          <p className="text-sm text-charcoal/70 bg-mint/5 p-3 rounded-lg">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {appointment.status === AppointmentStatus.NEEDS_APPROVAL && appointment.isUpcoming ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                              onClick={() => handleApprove(appointment.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDecline(appointment.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <>
                            {appointment.meetingLink && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-mint/30 hover:bg-mint/10 bg-transparent"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Join Meeting
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formattedAppointments.length === 0 && (
                <Card className="border-mint/20">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-mint-dark" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal mb-2">
                      {filter === "all" ? "No appointments yet" : `No ${filter} appointments`}
                    </h3>
                    <p className="text-charcoal/60 mb-4">
                      {filter === "all"
                        ? "Schedule your first appointment to get started"
                        : "Try changing the filter to see other appointments"}
                    </p>
                    {filter === "all" && (
                      <Button className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule First Appointment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
