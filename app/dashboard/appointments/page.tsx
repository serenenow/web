"use client"

import { useState } from "react"
import { Calendar, Clock, ExternalLink, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function AppointmentsPage() {
  const [user] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
  })

  const [filter, setFilter] = useState("all")
  const [appointments] = useState([
    {
      id: "1",
      client: "John Doe",
      service: "Individual Therapy",
      date: "Dec 3, 2024",
      time: "2:00 PM - 2:50 PM",
      status: "confirmed",
      paymentStatus: "paid",
      meetingLink: "https://meet.google.com/abc-def-ghi",
      notes: "Follow-up on anxiety management techniques",
    },
    {
      id: "2",
      client: "Sarah Miller",
      service: "Couples Counseling",
      date: "Dec 4, 2024",
      time: "10:00 AM - 11:00 AM",
      status: "confirmed",
      paymentStatus: "pending",
      meetingLink: "https://meet.google.com/xyz-uvw-rst",
      notes: "Communication patterns discussion",
    },
    {
      id: "3",
      client: "Mike Rodriguez",
      service: "Individual Therapy",
      date: "Dec 5, 2024",
      time: "3:00 PM - 3:50 PM",
      status: "pending",
      paymentStatus: "unpaid",
      meetingLink: null,
      notes: "",
    },
    {
      id: "4",
      client: "Emma Wilson",
      service: "Individual Therapy",
      date: "Nov 30, 2024",
      time: "1:00 PM - 1:50 PM",
      status: "completed",
      paymentStatus: "paid",
      meetingLink: null,
      notes: "Discussed coping strategies for work stress",
    },
  ])

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true
    return appointment.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-mint/20 text-mint-dark"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "unpaid":
        return "bg-red-100 text-red-800"
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-mint/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-charcoal">{appointment.client}</h3>
                        <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Badge variant="secondary" className={getPaymentStatusColor(appointment.paymentStatus)}>
                          {appointment.paymentStatus}
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
                      {appointment.meetingLink && (
                        <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Join Meeting
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="hover:bg-mint/10">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
      </main>
    </div>
  )
}
