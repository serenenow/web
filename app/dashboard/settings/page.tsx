"use client"

import { useState } from "react"
import { User, Bell, CreditCard, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function SettingsPage() {
  const [user] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
  })

  const [profile, setProfile] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    phone: "+91 98765 43210",
    bio: "Licensed clinical psychologist with 8 years of experience in individual and couples therapy.",
    rciNumber: "RCI12345",
    specialization: "Clinical Psychology",
    timezone: "Asia/Kolkata",
  })

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailPayments: true,
    emailReminders: false,
    smsReminders: true,
    marketingEmails: false,
  })

  const [bankDetails, setBankDetails] = useState({
    accountNumber: "****1234",
    ifscCode: "HDFC0001234",
    accountHolderName: "Dr. Sarah Johnson",
    bankName: "HDFC Bank",
  })

  const handleSaveProfile = () => {
    logger.log("Saving profile:", profile)
  }

  const handleSaveNotifications = () => {
    logger.log("Saving notifications:", notifications)
  }

  const handleSaveBankDetails = () => {
    logger.log("Saving bank details:", bankDetails)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal mb-2">Settings</h1>
            <p className="text-charcoal/70">Manage your account preferences and settings</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card className="border-mint/20">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal">
                  <User className="h-5 w-5 mr-2 text-mint-dark" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-charcoal">First Name</label>
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">Last Name</label>
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-charcoal">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">Phone</label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-charcoal">Bio</label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-charcoal">RCI Number</label>
                    <Input
                      value={profile.rciNumber}
                      onChange={(e) => setProfile((prev) => ({ ...prev, rciNumber: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">Specialization</label>
                    <Input
                      value={profile.specialization}
                      onChange={(e) => setProfile((prev) => ({ ...prev, specialization: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-mint/20">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal">
                  <Bell className="h-5 w-5 mr-2 text-mint-dark" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal">Email notifications for appointments</p>
                    <p className="text-sm text-charcoal/60">Get notified when appointments are booked or cancelled</p>
                  </div>
                  <Switch
                    checked={notifications.emailAppointments}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailAppointments: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal">Email notifications for payments</p>
                    <p className="text-sm text-charcoal/60">Get notified when payments are received</p>
                  </div>
                  <Switch
                    checked={notifications.emailPayments}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailPayments: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal">SMS reminders</p>
                    <p className="text-sm text-charcoal/60">Send SMS reminders to clients before appointments</p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, smsReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal">Marketing emails</p>
                    <p className="text-sm text-charcoal/60">Receive updates about new features and tips</p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>

                <Button onClick={handleSaveNotifications} className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card className="border-mint/20">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal">
                  <CreditCard className="h-5 w-5 mr-2 text-mint-dark" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-charcoal">Account Number</label>
                    <Input
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">IFSC Code</label>
                    <Input
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails((prev) => ({ ...prev, ifscCode: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-charcoal">Account Holder Name</label>
                    <Input
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">Bank Name</label>
                    <Input
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveBankDetails} className="bg-mint-dark hover:bg-mint-dark/90 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
