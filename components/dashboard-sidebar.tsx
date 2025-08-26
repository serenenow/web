"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  Users,
  Calendar,
  Clock,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { STORAGE_KEYS, clearAllStorage } from "@/lib/utils/secure-storage"

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Services", href: "/dashboard/services", icon: Briefcase },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Availability", href: "/dashboard/availability", icon: Clock },
  { name: "Payouts", href: "/dashboard/payouts", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardSidebarProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
}

function SidebarContent({ user, onNavigate }: { user: DashboardSidebarProps["user"]; onNavigate?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const handleLogout = () => {
    try {
      // Use clearAllStorage to clear all storage data (both secure and plain)
      clearAllStorage()
      router.push("/login")
    } catch (error) {
      logger.error("Logout error:", error)
      window.location.href = "/login"
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onNavigate?.()
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-mint/20 flex flex-col h-full transition-all duration-300",
        !isMobile && (isCollapsed ? "w-16" : "w-64"),
        isMobile && "w-full",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-mint/20">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center">
              <Image src="/favicon.png" alt="SereneNow Logo" width={32} height={32} />
              <span className="text-xl font-bold bg-gradient-to-r from-mint-dark to-indigo bg-clip-text text-transparent ml-3">
                SereneNow
              </span>
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-charcoal/60 hover:text-charcoal"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-12 px-4",
                  isActive
                    ? "bg-mint/10 text-mint-dark hover:bg-mint/20 font-medium"
                    : "text-charcoal/70 hover:text-charcoal hover:bg-mint/5",
                  isCollapsed && !isMobile && "justify-center px-2",
                )}
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className={cn("h-5 w-5", (!isCollapsed || isMobile) && "mr-3")} />
                {(!isCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-mint/20">
        {!isCollapsed || isMobile ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-mint/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-mint-dark">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{user.name}</p>
                <p className="text-xs text-charcoal/60 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-charcoal/70 hover:text-charcoal hover:bg-mint/5 h-10"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xs font-semibold text-mint-dark">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="w-full text-charcoal/70 hover:text-charcoal hover:bg-mint/5"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isMobile) {
    return (
      <>
        {/* Mobile Header - Clean design without logo/text */}
        <div className="md:hidden bg-white border-b border-mint/20 px-4 py-3 flex items-center justify-end">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-charcoal/60 hover:text-charcoal">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </>
    )
  }

  return <SidebarContent user={user} />
}
