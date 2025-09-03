"use client"

import { useState } from "react"
import {
  Users,
  Calendar,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/utils/logger"
import {
  getAdminStats,
  confirmAppointment,
  authenticateAdmin,
  getAdminTransactions,
  type AdminPaymentTransactionDetails,
} from "@/lib/api/admin"
import type { ExpertDto } from "@/lib/api/users"

interface AdminStatsDisplay {
  totalAppointments: {
    total: number
    byStatus: {
      PAYMENT_PENDING: number
      NEEDS_APPROVAL: number
      SCHEDULED: number
      COMPLETED: number
      CANCELLED: number
      NO_SHOW: number
      PAYMENT_FAILED: number
    }
  }
  totalExperts: number
  emailVerifications: {
    total: number
    byStatus: {
      VERIFIED: number
      PENDING: number
    }
  }
  recentAppointments: Array<{
    id: string
    expertName: string
    appointmentDateTime: string
    status: string
    gatewayOrderId: string
  }>
  experts: ExpertDto[]
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)

  const [stats, setStats] = useState<AdminStatsDisplay | null>(null)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [confirmingOrder, setConfirmingOrder] = useState(false)

  const [selectedExpertId, setSelectedExpertId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [transactions, setTransactions] = useState<AdminPaymentTransactionDetails[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const { toast } = useToast()

  const handleLogin = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter the admin password.",
        variant: "destructive",
      })
      return
    }

    try {
      setAuthenticating(true)
      const response = await authenticateAdmin(password.trim())

      if (response.success) {
        setIsAuthenticated(true)
        setPassword("")
        toast({
          title: "Success",
          description: "Successfully authenticated as admin",
        })
        // Load stats after successful authentication
        await fetchStats()
      } else {
        throw new Error(response.message || "Authentication failed")
      }
    } catch (error) {
      logger.error("Error authenticating admin:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed. Please check your password.",
        variant: "destructive",
      })
    } finally {
      setAuthenticating(false)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getAdminStats()

      // Transform the API response to match the display interface
      const transformedStats: AdminStatsDisplay = {
        totalAppointments: {
          total: data.totalAppointments,
          byStatus: data.appointmentsByStatus,
        },
        totalExperts: data.totalExperts,
        emailVerifications: {
          total: data.totalEmailVerifications,
          byStatus: data.emailVerificationsByStatus,
        },
        recentAppointments: data.recentAppointments,
        experts: data.experts,
      }

      setStats(transformedStats)
    } catch (error) {
      logger.error("Error fetching admin stats:", error)
      toast({
        title: "Error",
        description: "Failed to load admin statistics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFetchTransactions = async () => {
    if (!selectedExpertId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select an expert and both start and end dates.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoadingTransactions(true)
      const transactionData = await getAdminTransactions(selectedExpertId, startDate, endDate)
      setTransactions(transactionData)

      toast({
        title: "Success",
        description: `Found ${transactionData.length} transactions`,
      })
    } catch (error) {
      logger.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transaction details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleConfirmAppointment = async () => {
    if (!orderId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order ID.",
        variant: "destructive",
      })
      return
    }

    try {
      setConfirmingOrder(true)
      const response = await confirmAppointment(orderId.trim())

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Appointment confirmed successfully",
        })

        setOrderId("")
        // Refresh stats after successful confirmation
        await fetchStats()
      } else {
        throw new Error(response.message || "Failed to confirm appointment")
      }
    } catch (error) {
      logger.error("Error confirming appointment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConfirmingOrder(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "SCHEDULED":
        return "bg-mint/20 text-mint-dark"
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "NEEDS_APPROVAL":
        return "bg-orange-100 text-orange-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "NO_SHOW":
        return "bg-gray-100 text-gray-800"
      case "PAYMENT_FAILED":
        return "bg-red-200 text-red-900"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime)
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return dateTime
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-mint/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-charcoal mb-2">Admin Login</CardTitle>
            <p className="text-charcoal/70">Enter your admin password to access the dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-charcoal/50" />
                ) : (
                  <Eye className="h-4 w-4 text-charcoal/50" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleLogin}
              disabled={authenticating || !password.trim()}
              className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white"
            >
              {authenticating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">Admin Dashboard</h1>
            <p className="text-charcoal/70 text-sm md:text-base">Monitor platform statistics and manage appointments</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchStats}
              disabled={loading}
              variant="outline"
              className="border-mint/30 hover:bg-mint/10 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              className="border-coral/30 hover:bg-coral/10 bg-transparent text-coral"
            >
              Logout
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border-mint/20">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-mint/20 rounded-lg mb-4"></div>
                    <div className="h-4 bg-mint/20 rounded mb-2"></div>
                    <div className="h-6 bg-mint/20 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
              {/* Total Appointments */}
              <Card className="border-mint/20 hover:border-mint-dark/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-mint-dark" />
                    </div>
                    <Badge variant="secondary" className="bg-mint/20 text-mint-dark">
                      {stats.totalAppointments.total}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Total Appointments</h3>
                  <div className="space-y-1 text-sm text-charcoal/70">
                    <div className="flex justify-between">
                      <span>Scheduled:</span>
                      <span className="font-medium text-mint-dark">{stats.totalAppointments.byStatus.SCHEDULED}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Pending:</span>
                      <span className="font-medium text-yellow-600">
                        {stats.totalAppointments.byStatus.PAYMENT_PENDING}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Needs Approval:</span>
                      <span className="font-medium text-orange-600">
                        {stats.totalAppointments.byStatus.NEEDS_APPROVAL}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Experts */}
              <Card className="border-coral/20 hover:border-coral/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-coral" />
                    </div>
                    <Badge variant="secondary" className="bg-coral/20 text-coral">
                      {stats.totalExperts}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Total Experts</h3>
                  <p className="text-sm text-charcoal/70">Active therapists on platform</p>
                </CardContent>
              </Card>

              {/* Email Verifications */}
              <Card className="border-mint/20 hover:border-mint-dark/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-mint-dark" />
                    </div>
                    <Badge variant="secondary" className="bg-mint/20 text-mint-dark">
                      {stats.emailVerifications.total}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Email Verifications</h3>
                  <div className="space-y-1 text-sm text-charcoal/70">
                    <div className="flex justify-between">
                      <span>Verified:</span>
                      <span className="font-medium text-green-600">{stats.emailVerifications.byStatus.VERIFIED}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-medium text-yellow-600">{stats.emailVerifications.byStatus.PENDING}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Confirmation */}
              <Card className="border-coral/20 hover:border-coral/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-coral" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-4">Manual Confirmation</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter Order ID"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                    <Button
                      onClick={handleConfirmAppointment}
                      disabled={confirmingOrder || !orderId.trim()}
                      className="w-full bg-coral hover:bg-coral/90 text-white"
                    >
                      {confirmingOrder ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Appointment
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-mint/20 hover:border-mint-dark/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-mint-dark" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-4">Transaction Details</h3>
                  <div className="space-y-3">
                    <Select value={selectedExpertId} onValueChange={setSelectedExpertId}>
                      <SelectTrigger className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
                        <SelectValue placeholder="Select Expert" />
                      </SelectTrigger>
                      <SelectContent>
                        {stats.experts.map((expert) => (
                          <SelectItem key={expert.id} value={expert.id}>
                            {expert.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      placeholder="Start Date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                    <Input
                      type="date"
                      placeholder="End Date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                    <Button
                      onClick={handleFetchTransactions}
                      disabled={loadingTransactions || !selectedExpertId || !startDate || !endDate}
                      className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white"
                    >
                      {loadingTransactions ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Get Transactions
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {transactions.length > 0 && (
              <Card className="border-mint/20 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-charcoal text-xl">
                    <CreditCard className="h-5 w-5 mr-2 text-mint-dark" />
                    Transaction Details ({transactions.length} transactions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {/* Table Header */}
                      <div className="grid grid-cols-7 gap-4 p-4 bg-mint/5 rounded-lg mb-4 text-sm font-medium text-charcoal/70">
                        <div>Gateway Order ID</div>
                        <div>Total Amount</div>
                        <div>Expert Earnings</div>
                        <div>Platform Fee</div>
                        <div>Gateway</div>
                        <div>Status</div>
                        <div>Created At</div>
                      </div>

                      {/* Scrollable Table Rows */}
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="grid grid-cols-7 gap-4 p-4 bg-white border border-mint/10 rounded-lg hover:border-mint/20 transition-colors"
                          >
                            <div className="text-sm font-mono text-charcoal/80 truncate">
                              {transaction.gatewayOrderId || "N/A"}
                            </div>
                            <div className="text-sm font-semibold text-charcoal">
                              {formatCurrency(transaction.totalAmount)}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(transaction.expertEarnings)}
                            </div>
                            <div className="text-sm font-medium text-coral">
                              {formatCurrency(transaction.platformFee)}
                            </div>
                            <div className="text-sm text-charcoal/70">{transaction.gateway}</div>
                            <div>
                              <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-charcoal/70">{formatDateTime(transaction.createdAt)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Totals Row */}
                      <div className="grid grid-cols-7 gap-4 p-4 bg-mint/10 rounded-lg mt-4 text-sm font-bold text-charcoal border-t-2 border-mint/30">
                        <div className="text-mint-dark">TOTALS</div>
                        <div className="text-charcoal">
                          {formatCurrency(transactions.reduce((sum, t) => sum + t.totalAmount, 0))}
                        </div>
                        <div className="text-green-700">
                          {formatCurrency(transactions.reduce((sum, t) => sum + t.expertEarnings, 0))}
                        </div>
                        <div className="text-coral">
                          {formatCurrency(transactions.reduce((sum, t) => sum + t.platformFee, 0))}
                        </div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Appointments Table */}
            <Card className="border-mint/20">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal text-xl">
                  <Calendar className="h-5 w-5 mr-2 text-mint-dark" />
                  Recent Appointments (Last 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 gap-4 p-4 bg-mint/5 rounded-lg mb-4 text-sm font-medium text-charcoal/70">
                        <div>Appointment ID</div>
                        <div>Expert Name</div>
                        <div>Date & Time</div>
                        <div>Status</div>
                        <div>Gateway Order ID</div>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-2">
                        {stats.recentAppointments.map((appointment, index) => (
                          <div
                            key={appointment.id}
                            className="grid grid-cols-5 gap-4 p-4 bg-white border border-mint/10 rounded-lg hover:border-mint/20 transition-colors"
                          >
                            <div className="text-sm font-mono text-charcoal/80 truncate">{appointment.id}</div>
                            <div className="text-sm text-charcoal font-medium">{appointment.expertName}</div>
                            <div className="text-sm text-charcoal/70">
                              {formatDateTime(appointment.appointmentDateTime)}
                            </div>
                            <div>
                              <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="text-sm font-mono text-charcoal/80 truncate">
                              {appointment.gatewayOrderId || "N/A"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-mint-dark" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal mb-2">No appointments found</h3>
                    <p className="text-charcoal/60">Recent appointments will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-mint/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">Failed to load data</h3>
              <p className="text-charcoal/60 mb-4">Unable to fetch admin statistics</p>
              <Button onClick={fetchStats} className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
