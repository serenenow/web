"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SetupChecklist } from "@/components/setup-checklist"
import { DashboardContent } from "@/components/dashboard-content"
import { getAuthToken, getExpertData } from "@/lib/api/auth"
import { fetchDashboardData, DashboardData } from "@/lib/api/dashboard"

export default function DashboardPage() {
  const [user, setUser] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
    id: ""
  })

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    services: [],
    appointments: [],
    isNewUser: true
  })
  const [isNewUser, setIsNewUser] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication and load user data
    const checkAuth = async () => {
      try {
        const token = getAuthToken()
        const expertData = getExpertData()

        if (!token) {
          router.push("/login")
          return
        }

        // Load expert data if available
        if (expertData) {
          setUser({
            name: expertData.name,
            email: expertData.email,
            id: expertData.id
          })
          
          // Fetch dashboard data using expert ID
          const data = await fetchDashboardData(expertData.id)
          setDashboardData(data)
          console.log(data.isNewUser);
          setIsNewUser(data.isNewUser)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSetupStep = (stepId: string) => {
    switch (stepId) {
      case "service":
        router.push("/dashboard/services")
        break
      case "schedule":
        router.push("/dashboard/availability")
        break
      case "client":
        // For demo, mark setup as complete when they try to invite a client
        if (typeof window !== "undefined") {
          localStorage.setItem("setup_complete", "true")
        }
        setIsNewUser(false)
        break
      default:
        break
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-mint-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-mint-light/30 via-white to-lavender-light/30">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">
              {isNewUser ? "Welcome to SereneNow! 👋" : `Welcome back, ${user.name.split(" ")[1]}! 👋`}
            </h1>
            <p className="text-charcoal/70 text-sm md:text-base">
              {isNewUser
                ? "Let's get your practice set up and ready for clients."
                : "Here's what's happening with your practice today."}
            </p>
          </div>

          {/* Content */}
          {isNewUser ? <SetupChecklist onStepClick={handleSetupStep} /> : <DashboardContent 
            isNewUser={false}
            services={dashboardData.services}
            appointments={dashboardData.appointments}
          />}
        </div>
      </main>
    </div>
  )
}
