"use client"

import { useState } from "react"
import { Search, Plus, Mail, Phone, Calendar, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function ClientsPage() {
  const [user] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [clients] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+91 98765 43210",
      status: "active",
      lastSession: "Dec 1, 2024",
      totalSessions: 8,
      service: "Individual Therapy",
    },
    {
      id: "2",
      name: "Sarah Miller",
      email: "sarah.m@email.com",
      phone: "+91 87654 32109",
      status: "active",
      lastSession: "Nov 28, 2024",
      totalSessions: 12,
      service: "Couples Counseling",
    },
    {
      id: "3",
      name: "Mike Rodriguez",
      email: "mike.r@email.com",
      phone: "+91 76543 21098",
      status: "inactive",
      lastSession: "Oct 15, 2024",
      totalSessions: 5,
      service: "Individual Therapy",
    },
  ])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">Clients</h1>
              <p className="text-charcoal/70">Manage your client relationships</p>
            </div>
            <Button className="bg-mint-dark hover:bg-mint-dark/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Search */}
          <Card className="border-mint/20 mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                />
              </div>
            </CardContent>
          </Card>

          {/* Clients List */}
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="border-mint/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-mint/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-mint-dark">
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-charcoal">{client.name}</h3>
                          <Badge
                            variant="secondary"
                            className={
                              client.status === "active" ? "bg-mint/20 text-mint-dark" : "bg-gray-100 text-gray-600"
                            }
                          >
                            {client.status}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-charcoal/60">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {client.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {client.phone}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-charcoal/60 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Last session: {client.lastSession}
                          </div>
                          <div>Total sessions: {client.totalSessions}</div>
                          <div>Service: {client.service}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                        View Profile
                      </Button>
                      <Button size="sm" variant="ghost" className="hover:bg-mint/10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <Card className="border-mint/20">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-mint-dark" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  {searchTerm ? "No clients found" : "No clients yet"}
                </h3>
                <p className="text-charcoal/60 mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start building your practice by adding your first client"}
                </p>
                {!searchTerm && (
                  <Button className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Client
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
