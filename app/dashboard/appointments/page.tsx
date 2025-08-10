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
} from "@/lib/api/appointments"
import { getExpertData } from "@/lib/api/auth"
import { format, parseISO } from "date-fns"

export default function AppointmentsPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  })

  const [filter, setFilter] = useState("all")
  const [appointments, setAppointments] = useState<ExpertAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (appointmentId: string) => {
    try {
      await approveAppointment(appointmentId)
      // Refresh appointments
      const data = await fetchUpcomingAppointments()
      setAppointments(data)
    } catch (error) {
      console.error("Error approving appointment:", error)
    }
  }

  const handleDecline = async (appointmentId: string) => {
    try {
      await declineAppointment(appointmentId)
      // Refresh appointments
      const data = await fetchUpcomingAppointments()
      setAppointments(data)
    } catch (error) {
      console.error("Error declining appointment:", error)
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
        const data = await fetchUpcomingAppointments()
        setAppointments(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("Failed to load appointments. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  // Format appointment data for display
  const formattedAppointments = appointments.map((appointment) => {
    const startDate = parseISO(appointment.startTime)
    const endDate = parseISO(appointment.endTime)

    return {
      id: appointment.id,
      client: appointment.client.name,
      service: appointment.service.title,
      date: format(startDate, "MMM d, yyyy"),
      time: `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`,
      status: appointment.status.toLowerCase() === "pending" ? "needs_approval" : appointment.status.toLowerCase(),
      meetingLink: appointment.meetingLink || null,
      notes: appointment.notes || "",
    }
  })

  const filteredAppointments = formattedAppointments.filter((appointment) => {
    if (filter === "all") return true
    return appointment.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-mint/20 text-mint-dark"
      case "needs_approval":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-600"
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
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Appointments</SelectItem>
                    <SelectItem value="needs_approval">Needs Approval</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
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
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-mint/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-charcoal">{appointment.client}</h3>
                          <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                            {appointment.status === "needs_approval" ? "Needs Approval" : appointment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-charcoal/60 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {appointment.time}
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
                        {appointment.status === "needs_approval" ? (
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

              {filteredAppointments.length === 0 && (
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
