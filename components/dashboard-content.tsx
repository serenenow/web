"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, Clock, ExternalLink, Plus, Edit, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface DashboardContentProps {
  isNewUser: boolean
}

export function DashboardContent({ isNewUser }: DashboardContentProps) {
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    service: "",
    paymentMode: "",
  })

  // Mock data for returning users
  const upcomingAppointments = [
    {
      id: "1",
      client: "John D.",
      service: "Individual Therapy",
      time: "Today, 2:00 PM",
      hasLink: true,
    },
    {
      id: "2",
      client: "Sarah M.",
      service: "Couples Counseling",
      time: "Tomorrow, 10:00 AM",
      hasLink: false,
    },
    {
      id: "3",
      client: "Mike R.",
      service: "Individual Therapy",
      time: "Dec 5, 3:00 PM",
      hasLink: true,
    },
  ]

  const services = [
    {
      id: "1",
      name: "Individual Therapy",
      duration: "50 minutes",
      fee: "₹2,000",
      status: "active",
    },
    {
      id: "2",
      name: "Couples Counseling",
      duration: "60 minutes",
      fee: "₹3,000",
      status: "active",
    },
  ]

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle invite submission
    console.log("Invite form:", inviteForm)
    // Reset form
    setInviteForm({ name: "", email: "", service: "", paymentMode: "" })
  }

  if (isNewUser) {
    return null // Setup checklist will be shown instead
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      {/* Upcoming Appointments */}
      <Card className="border-mint/20">
        <CardHeader>
          <CardTitle className="flex items-center text-charcoal text-lg">
            <Calendar className="h-5 w-5 mr-2 text-mint-dark" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-mint/5 rounded-lg gap-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-charcoal">{appointment.client}</p>
                    <p className="text-sm text-charcoal/60">{appointment.service}</p>
                    <p className="text-sm text-mint-dark font-medium">{appointment.time}</p>
                  </div>
                  {appointment.hasLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-mint/30 hover:bg-mint/10 bg-transparent w-full sm:w-auto"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-charcoal/60 text-center py-4">No upcoming appointments</p>
            )}
            <Button className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white">View All Appointments</Button>
          </div>
        </CardContent>
      </Card>

      {/* Your Services */}
      <Card className="border-mint/20">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between text-charcoal gap-3">
            <div className="flex items-center text-lg">
              <Plus className="h-5 w-5 mr-2 text-mint-dark" />
              Your Services
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-mint/30 hover:bg-mint/10 bg-transparent w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Service
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-mint/5 rounded-lg gap-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-charcoal">{service.name}</p>
                    <p className="text-sm text-charcoal/60">
                      {service.duration} • {service.fee}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <Badge variant="secondary" className="bg-mint/20 text-mint-dark">
                      {service.status}
                    </Badge>
                    <Button size="sm" variant="ghost" className="hover:bg-mint/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-charcoal/60 text-center py-4">No services added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="border-mint/20">
        <CardHeader>
          <CardTitle className="flex items-center text-charcoal text-lg">
            <Clock className="h-5 w-5 mr-2 text-mint-dark" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-mint/5 rounded-lg">
              <p className="font-medium text-charcoal">Current Schedule</p>
              <p className="text-sm text-charcoal/60">Monday–Friday, 10:00 AM–5:00 PM</p>
              <p className="text-xs text-mint-dark mt-1">IST (Asia/Kolkata)</p>
            </div>
            <Button className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white">Update Schedule</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite Client */}
      <Card className="border-mint/20">
        <CardHeader>
          <CardTitle className="flex items-center text-charcoal text-lg">
            <Send className="h-5 w-5 mr-2 text-mint-dark" />
            Invite Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Client name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
              />
              <Input
                type="email"
                placeholder="Email address"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
              />
            </div>

            <Select
              value={inviteForm.service}
              onValueChange={(value) => setInviteForm((prev) => ({ ...prev, service: value }))}
            >
              <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.fee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={inviteForm.paymentMode}
              onValueChange={(value) => setInviteForm((prev) => ({ ...prev, paymentMode: value }))}
            >
              <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                <SelectValue placeholder="Payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serenenow">SereneNow (Online)</SelectItem>
                <SelectItem value="direct">Direct Payment</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="submit"
              className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white"
              disabled={!inviteForm.name || !inviteForm.email || !inviteForm.service || !inviteForm.paymentMode}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
