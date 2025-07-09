"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, Mail, Phone, Calendar, MoreVertical, X, Send, Check, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getExpertData } from "@/lib/api/auth"
import { ActivationStatus, AuthSource, Client, SendClientInviteRequest, getExpertClients, sendClientInvite } from "@/lib/api/client"
import { getExpertServices, type Service } from "@/lib/api/service"

interface ServiceDisplay {
  id: string
  name: string
  duration: string
  fee: string
  status: string
}

interface PaymentOption {
  value: string
  title: string
  description: string
  recommended?: boolean
}

const paymentOptions: PaymentOption[] = [
  {
    value: "ONLINE_ONLY",
    title: "Online Payment Only",
    description: "Cards, UPI, Net Banking",
    recommended: true,
  },
  {
    value: "ONLINE_AND_DIRECT",
    title: "Online + Direct Payment",
    description: "Both options available",
  },
  {
    value: "DIRECT_ONLY",
    title: "Direct Payment Only",
    description: "Cash or Bank Transfer",
  },
]

export default function ClientsPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    id: "", // Expert ID for API calls
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)

  const [inviteForm, setInviteForm] = useState({
    clientName: "",
    clientEmail: "",
    selectedServices: [] as string[],
    paymentOption: "",
    directPaymentInstructions: "",
  })

  const [services, setServices] = useState<ServiceDisplay[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Load expert data, clients and services on component mount
  useEffect(() => {
    loadExpertData()
    fetchClients()
  }, [])

  // Load services when invite form is opened
  useEffect(() => {
    if (showInviteForm && services.length === 0) {
      fetchServices()
    }
  }, [showInviteForm])

  const loadExpertData = () => {
    const expertData = getExpertData()
    if (expertData) {
      setUser({
        name: expertData.name || "",
        email: expertData.email || "",
        id: expertData.id || "",
      })
    }
  }

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      // Get expert ID from local storage if not already set in state
      let expertId = user.id
      if (!expertId) {
        const expertData = getExpertData()
        expertId = expertData?.id || ""

        // Update user state if we got data from local storage
        if (expertData) {
          setUser({
            name: expertData.name || "",
            email: expertData.email || "",
            id: expertId,
          })
        }
      }

      if (!expertId) {
        console.error("No expert ID available")
        setIsLoading(false)
        return
      }

      const fetchedClients = await getExpertClients(expertId)
      setClients(fetchedClients)
    } catch (error) {
      console.error("Failed to fetch clients:", error)
      // Show error message to user
      alert("Failed to fetch clients. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServices = async () => {
    setLoadingServices(true)
    try {
      // Get expert ID from local storage if not already set in state
      let expertId = user.id
      if (!expertId) {
        const expertData = getExpertData()
        expertId = expertData?.id || ""
      }

      if (!expertId) {
        console.error("No expert ID available")
        setLoadingServices(false)
        return
      }

      const fetchedServices = await getExpertServices(expertId)

      // Map API services to the display format
      const serviceDisplays = fetchedServices.map((service) => ({
        id: service.id,
        name: service.title,
        duration: `${service.durationMin} minutes`,
        fee: `₹${service.price.toLocaleString()}`,
        status: "active",
      }))

      setServices(serviceDisplays)
    } catch (error) {
      console.error("Failed to fetch services:", error)
      // Show error message to user
      alert("Failed to fetch services. Please try again.")
    } finally {
      setLoadingServices(false)
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setInviteForm((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }))
  }

  const handlePaymentOptionChange = (value: string) => {
    setInviteForm((prev) => ({
      ...prev,
      paymentOption: value,
      // Clear direct payment instructions if switching to online only
      directPaymentInstructions: value === "ONLINE_ONLY" ? "" : prev.directPaymentInstructions,
    }))
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get expert ID from local storage if not already set in state
      let expertId = user.id
      if (!expertId) {
        const expertData = getExpertData()
        expertId = expertData?.id || ""
      }

      if (!expertId) {
        console.error("No expert ID available")
        alert("Unable to send invitation. Please try again later.")
        setIsSubmitting(false)
        return
      }

      // Determine if direct payment is allowed based on payment option
      const allowDirectPayment =
        inviteForm.paymentOption === "ONLINE_AND_DIRECT" || inviteForm.paymentOption === "DIRECT_ONLY"

      // Create the invite request
      const inviteRequest: SendClientInviteRequest = {
        expertId: expertId,
        name: inviteForm.clientName,
        email: inviteForm.clientEmail,
        serviceIds: inviteForm.selectedServices,
        allowDirectPayment: allowDirectPayment,
        directPaymentInstructions: allowDirectPayment ? inviteForm.directPaymentInstructions : null,
      }

      // Send the invite
      await sendClientInvite(inviteRequest)

      // Show success message
      setInviteSuccess(true)

      // Reset form
      setInviteForm({
        clientName: "",
        clientEmail: "",
        selectedServices: [],
        paymentOption: "",
        directPaymentInstructions: "",
      })

      // Refresh clients list
      fetchClients()

      // Hide success message after 3 seconds
      setTimeout(() => {
        setInviteSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to send client invitation:", error)
      alert("Failed to send invitation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    inviteForm.clientName &&
    inviteForm.clientEmail &&
    inviteForm.selectedServices.length > 0 &&
    inviteForm.paymentOption &&
    // If direct payment is involved, instructions are required
    (inviteForm.paymentOption === "ONLINE_ONLY" || inviteForm.directPaymentInstructions.trim() !== "")

  const showDirectPaymentField =
    inviteForm.paymentOption === "ONLINE_AND_DIRECT" || inviteForm.paymentOption === "DIRECT_ONLY"

  return (
    <TooltipProvider>
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
              <Button
                className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                onClick={() => setShowInviteForm(!showInviteForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>

            {/* Invite Client Form */}
            {showInviteForm && (
              <Card className="border-mint/20 mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-xl font-semibold text-charcoal">Invite New Client</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInviteForm(false)}
                    className="hover:bg-mint/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {inviteSuccess ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-charcoal mb-2">Invitation Sent Successfully!</h3>
                        <p className="text-charcoal/60">
                          Your client will receive an email invitation to join your practice.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleInviteSubmit} className="space-y-6">
                      {/* Client Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="clientName" className="block text-sm font-medium text-charcoal mb-2">
                            Client Name *
                          </label>
                          <Input
                            id="clientName"
                            placeholder="Enter client's full name"
                            value={inviteForm.clientName}
                            onChange={(e) => setInviteForm((prev) => ({ ...prev, clientName: e.target.value }))}
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="clientEmail" className="block text-sm font-medium text-charcoal mb-2">
                            Client Email *
                          </label>
                          <Input
                            id="clientEmail"
                            type="email"
                            placeholder="Enter client's email address"
                            value={inviteForm.clientEmail}
                            onChange={(e) => setInviteForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                            required
                          />
                        </div>
                      </div>

                      {/* Services Selection */}
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-3">Select Services *</label>
                        {loadingServices ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-mint-dark" />
                            <span className="ml-2 text-charcoal/60">Loading services...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {services.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-center space-x-3 p-3 border border-mint/20 rounded-lg hover:bg-mint/5 transition-colors"
                              >
                                <Checkbox
                                  id={`service-${service.id}`}
                                  checked={inviteForm.selectedServices.includes(service.id)}
                                  onCheckedChange={() => handleServiceToggle(service.id)}
                                  className="data-[state=checked]:bg-mint-dark data-[state=checked]:border-mint-dark"
                                />
                                <label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                                  <div className="font-medium text-charcoal">{service.name}</div>
                                  <div className="text-sm text-charcoal/60">
                                    {service.duration} • {service.fee}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        {inviteForm.selectedServices.length === 0 && !loadingServices && (
                          <p className="text-sm text-red-500 mt-2">Please select at least one service</p>
                        )}
                      </div>

                      {/* Payment Options */}
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-3">Payment Options *</label>
                        <div className="space-y-3">
                          {paymentOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                                inviteForm.paymentOption === option.value
                                  ? "border-mint-dark bg-mint/10"
                                  : "border-mint/20 hover:bg-mint/5"
                              }`}
                              onClick={() => handlePaymentOptionChange(option.value)}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                                    inviteForm.paymentOption === option.value
                                      ? "border-mint-dark bg-mint-dark"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {inviteForm.paymentOption === option.value && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-charcoal">{option.title}</h4>
                                    {option.recommended && (
                                      <Badge className="bg-mint/20 text-mint-dark text-xs">Recommended</Badge>
                                    )}
                                    {option.value === "ONLINE_ONLY" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-4 w-4 text-charcoal/40 hover:text-charcoal/60 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <p className="text-sm">
                                            When clients pay through SereneNow, a small platform fee (3.5%) is added on
                                            top of your session price. This helps cover payment gateway charges and
                                            supports the infrastructure that powers the app. You still receive your full
                                            session fee.
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  <p className="text-sm text-charcoal/60 mt-1">{option.description}</p>
                                  {option.recommended && (
                                    <p className="text-xs text-mint-dark mt-2">
                                      ✓ Secure payments ✓ Automatic receipts ✓ Easy refunds
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Direct Payment Instructions */}
                      {showDirectPaymentField && (
                        <div>
                          <label
                            htmlFor="directPaymentInstructions"
                            className="block text-sm font-medium text-charcoal mb-2"
                          >
                            Direct Payment Instructions *
                          </label>
                          <Textarea
                            id="directPaymentInstructions"
                            placeholder="Example: Bank: HDFC Bank, Account: 1234567890, IFSC: HDFC0001234 or UPI: therapist@upi"
                            value={inviteForm.directPaymentInstructions}
                            onChange={(e) =>
                              setInviteForm((prev) => ({ ...prev, directPaymentInstructions: e.target.value }))
                            }
                            className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark min-h-[100px]"
                            required={showDirectPaymentField}
                          />
                          <p className="text-xs text-charcoal/60 mt-2">
                            Provide clear instructions for clients on how to make direct payments to you.
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowInviteForm(false)}
                          className="border-mint/30 hover:bg-mint/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={!isFormValid || isSubmitting}
                          className="bg-mint-dark hover:bg-mint-dark/90 text-white disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

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
              {isLoading ? (
                <Card className="border-mint/20">
                  <CardContent className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-mint-dark mx-auto mb-4" />
                    <p className="text-charcoal/60">Loading clients...</p>
                  </CardContent>
                </Card>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
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
                                  client.activationStatus === ActivationStatus.ACTIVATED ? "bg-mint/20 text-mint-dark" : "bg-gray-100 text-gray-600"
                                }
                              >
                                {client.activationStatus.toLowerCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-charcoal/60">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {client.email}
                              </div>

                            </div>

                            <div className="flex items-center space-x-4 text-sm text-charcoal/60 mt-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Time Zone: {client.timeZone || "Not set"}
                              </div>
                              <div>
                                Auth Source: {client.authSource}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-mint/30 hover:bg-mint/10 bg-transparent"
                          >
                            View Profile
                          </Button>
                          <Button size="sm" variant="ghost" className="hover:bg-mint/10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
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
                      <Button
                        className="bg-mint-dark hover:bg-mint-dark/90 text-white"
                        onClick={() => setShowInviteForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Client
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
