"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function ServicesPage() {
  const [user] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
  })

  const [services, setServices] = useState([
    {
      id: "1",
      name: "Individual Therapy",
      description: "One-on-one therapy sessions for personal growth and mental health support.",
      duration: 50,
      fee: 2000,
      location: "Online",
      status: "active",
    },
    {
      id: "2",
      name: "Couples Counseling",
      description: "Relationship therapy for couples working through challenges together.",
      duration: 60,
      fee: 3000,
      location: "Online",
      status: "active",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: "",
    fee: "",
    location: "online",
  })

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault()
    const service = {
      id: Date.now().toString(),
      name: newService.name,
      description: newService.description,
      duration: Number.parseInt(newService.duration),
      fee: Number.parseInt(newService.fee),
      location: newService.location === "online" ? "Online" : "In-person",
      status: "active",
    }
    setServices([...services, service])
    setNewService({ name: "", description: "", duration: "", fee: "", location: "online" })
    setShowAddForm(false)
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter((service) => service.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">Services</h1>
              <p className="text-charcoal/70">Manage your therapy services and pricing</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-mint-dark hover:bg-mint-dark/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Add Service Form */}
          {showAddForm && (
            <Card className="border-mint/20 mb-6">
              <CardHeader>
                <CardTitle className="text-charcoal">Add New Service</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Service name"
                      value={newService.name}
                      onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                      required
                    />
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={newService.duration}
                        onChange={(e) => setNewService((prev) => ({ ...prev, duration: e.target.value }))}
                        className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Fee (₹)"
                        value={newService.fee}
                        onChange={(e) => setNewService((prev) => ({ ...prev, fee: e.target.value }))}
                        className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                        required
                      />
                    </div>
                  </div>

                  <Textarea
                    placeholder="Service description"
                    value={newService.description}
                    onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
                    className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    required
                  />

                  <Select
                    value={newService.location}
                    onValueChange={(value) => setNewService((prev) => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in-person">In-person</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-3">
                    <Button type="submit" className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                      Add Service
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-mint/30 hover:bg-mint/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          <div className="grid gap-6">
            {services.map((service) => (
              <Card key={service.id} className="border-mint/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-charcoal">{service.name}</h3>
                        <Badge variant="secondary" className="bg-mint/20 text-mint-dark">
                          {service.status}
                        </Badge>
                      </div>
                      <p className="text-charcoal/70 mb-4">{service.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-charcoal/60">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} minutes
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />₹{service.fee.toLocaleString()}
                        </div>
                        <div>📍 {service.location}</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteService(service.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {services.length === 0 && !showAddForm && (
            <Card className="border-mint/20">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-mint-dark" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">No services yet</h3>
                <p className="text-charcoal/60 mb-4">Create your first service to start accepting clients</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
