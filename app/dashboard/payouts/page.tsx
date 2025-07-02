"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function PayoutsPage() {
  const [user] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
  })

  const [timeFilter, setTimeFilter] = useState("this-month")

  const stats = [
    { title: "Total Earnings", value: "₹45,000", change: "+12%", icon: DollarSign },
    { title: "This Month", value: "₹12,500", change: "+8%", icon: TrendingUp },
    { title: "Pending Payouts", value: "₹3,200", change: "", icon: Calendar },
  ]

  const payouts = [
    {
      id: "1",
      date: "Dec 1, 2024",
      amount: 8500,
      status: "completed",
      sessions: 5,
      method: "Bank Transfer",
      transactionId: "TXN123456789",
    },
    {
      id: "2",
      date: "Nov 1, 2024",
      amount: 12000,
      status: "completed",
      sessions: 7,
      method: "Bank Transfer",
      transactionId: "TXN987654321",
    },
    {
      id: "3",
      date: "Oct 1, 2024",
      amount: 9500,
      status: "completed",
      sessions: 6,
      method: "Bank Transfer",
      transactionId: "TXN456789123",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
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
              <h1 className="text-3xl font-bold text-charcoal mb-2">Payouts</h1>
              <p className="text-charcoal/70">Track your earnings and payment history</p>
            </div>
            <Button className="bg-mint-dark hover:bg-mint-dark/90 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-mint/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-charcoal/60">{stat.title}</p>
                      <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                      {stat.change && (
                        <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-mint-dark" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="border-mint/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-charcoal">Filter by:</span>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-48 border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="all-time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payouts List */}
          <Card className="border-mint/20">
            <CardHeader>
              <CardTitle className="text-charcoal">Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-mint/5 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-charcoal">₹{payout.amount.toLocaleString()}</h3>
                        <Badge variant="secondary" className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-charcoal/60">
                        <div>
                          <span className="font-medium">Date:</span> {payout.date}
                        </div>
                        <div>
                          <span className="font-medium">Sessions:</span> {payout.sessions}
                        </div>
                        <div>
                          <span className="font-medium">Method:</span> {payout.method}
                        </div>
                        <div>
                          <span className="font-medium">Transaction ID:</span> {payout.transactionId}
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="border-mint/30 hover:bg-mint/10 bg-transparent">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
