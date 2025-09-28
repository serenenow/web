"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SetupChecklist } from "@/components/setup-checklist"
import { DashboardContent } from "@/components/dashboard-content"
import { getAuthToken, getExpertData, removeAuthToken, validateAuthToken } from "@/lib/api/auth"
import { fetchDashboardData, type DashboardData } from "@/lib/api/dashboard"
import { STORAGE_KEYS, plainLocalStorage } from "@/lib/utils/secure-storage"
import { Button } from "@/components/ui/button"
import { Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/utils/logger"

export default function DashboardPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    id: "",
  })

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    services: [],
    appointments: [],
    isNewUser: true,
  })
  const [isSetupProfile, setupProfile] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const handleShareProfile = async () => {
    try {
      const profileLink = `${window.location.origin}/public-book/${user.id}`
      await navigator.clipboard.writeText(profileLink)
      toast({
        title: "Success",
        description: "Public profile link copied!",
      })
    } catch (error) {
      logger.error("Failed to copy link:", error)
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Check authentication and load user data
    const checkAuth = async () => {
      try {
        const token = getAuthToken()
        const expertData = getExpertData()

        if (!token || !expertData) {
          router.push("/login")
          return
        }

        // Validate if the token is still valid
        const isValid = await validateAuthToken()
        if (!isValid) {
          // Token is invalid, clear storage and redirect to login
          removeAuthToken()
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        // Load expert data if available
        setUser({
          name: expertData.name,
          email: expertData.email,
          id: expertData.id,
        })

        // Fetch dashboard data using expert ID
        try {
          const data = await fetchDashboardData(expertData.id)
          setDashboardData(data)
          const hasServiceSetup = data.services.length > 0
          setupProfile(hasServiceSetup)
          plainLocalStorage.setItem(STORAGE_KEYS.EXPERT_SETUP_PROFILE_COMPLETE, hasServiceSetup)
        } catch (dashboardError: any) {
          // Handle 401/403 errors from dashboard API calls
          if (dashboardError.status === 401 || dashboardError.status === 403) {
            removeAuthToken()
            toast({
              title: "Authentication required",
              description: "Please log in again to access your dashboard.",
              variant: "destructive",
            })
            router.push("/login")
            return
          }
          // For other errors, log but continue with empty data
          logger.error("Dashboard data fetch error:", dashboardError)
        }
      } catch (error: any) {
        logger.error("Auth check error:", error)
        // Handle authentication errors
        if (error.status === 401 || error.status === 403) {
          removeAuthToken()
          toast({
            title: "Authentication required",
            description: "Please log in again to access your dashboard.",
            variant: "destructive",
          })
        }
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const handleSetupStep = (stepId: string) => {
    switch (stepId) {
      case "service":
        router.push("/dashboard/services")
        break
      case "schedule":
        router.push("/dashboard/availability")
        break
      case "client":
        if (typeof window !== "undefined") {
          // Use plainLocalStorage instead of direct localStorage
          plainLocalStorage.setItem(STORAGE_KEYS.EXPERT_SETUP_PROFILE_COMPLETE, true)
        }
        setupProfile(true)
        router.push("/dashboard/clients")
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
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">
                  {isSetupProfile ? `Welcome back, ${user.name.split(" ")[0]}! 👋` : "Welcome to SereneNow! 👋"}
                </h1>
                <p className="text-charcoal/70 text-sm md:text-base">
                  {isSetupProfile
                    ? "Here's what's happening with your practice today."
                    : "Let's get your practice set up and ready for clients."}
                </p>
              </div>
              {isSetupProfile && (
                <Button
                  onClick={handleShareProfile}
                  variant="outline"
                  className="border-mint/30 hover:bg-mint/10 bg-transparent"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {isSetupProfile != true ? (
            <SetupChecklist onStepClick={handleSetupStep} />
          ) : (
            <DashboardContent
              isNewUser={false}
              services={dashboardData.services}
              appointments={dashboardData.appointments}
              expertId={user.id}
            />
          )}
        </div>
      </main>
    </div>
  )
}
