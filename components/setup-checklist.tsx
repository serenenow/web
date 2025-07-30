"use client"

import type React from "react"
import { useState } from "react"
import { Check, Plus, Calendar, UserPlus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  icon: React.ComponentType<{ className?: string }>
  action: string
  href?: string
}

interface SetupChecklistProps {
  onStepClick: (stepId: string) => void
}

export function SetupChecklist({ onStepClick }: SetupChecklistProps) {
  const [steps] = useState<SetupStep[]>([
    {
      id: "profile",
      title: "Create your profile",
      description: "Complete your professional profile",
      completed: true,
      icon: Check,
      action: "Completed",
    },
    {
      id: "service",
      title: "Add a service",
      description: "Create your first therapy service",
      completed: false,
      icon: Plus,
      action: "Add Service",
      href: "/dashboard/services",
    },
    {
      id: "schedule",
      title: "Set your schedule",
      description: "Define your availability",
      completed: false,
      icon: Calendar,
      action: "Set Schedule",
      href: "/dashboard/availability",
    },
    {
      id: "client",
      title: "Invite a client",
      description: "Send your first client invitation",
      completed: false,
      icon: UserPlus,
      action: "Invite Client",
    },
  ])

  const completedSteps = steps.filter((step) => step.completed).length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Progress Header */}
      <Card className="border-mint/20">
        <CardHeader>
          <CardTitle className="text-charcoal text-lg md:text-xl">Welcome to SereneNow! 🎉</CardTitle>
          <div className="space-y-3">
            <p className="text-charcoal/70 text-sm md:text-base">
              Let's get your practice set up. Complete these steps to start accepting clients.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Setup Progress</span>
                <span className="text-mint-dark font-medium">
                  {completedSteps} of {totalSteps} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Setup Steps */}
      <div className="grid gap-3 md:gap-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon
          return (
            <Card
              key={step.id}
              className={cn(
                "border transition-all duration-200 hover:shadow-md",
                step.completed ? "border-mint/30 bg-mint/5" : "border-mint/20 hover:border-mint/40",
              )}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div
                      className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0",
                        step.completed ? "bg-mint-dark text-white" : "bg-mint/10 text-mint-dark",
                      )}
                    >
                      {step.completed ? (
                        <Check className="h-5 w-5 md:h-6 md:w-6" />
                      ) : (
                        <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-charcoal text-sm md:text-base">{step.title}</h3>
                      <p className="text-xs md:text-sm text-charcoal/70">{step.description}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => onStepClick(step.id)}
                    disabled={step.completed}
                    className={cn(
                      "w-full sm:w-auto",
                      step.completed
                        ? "bg-mint/20 text-mint-dark cursor-default hover:bg-mint/20"
                        : "bg-mint-dark hover:bg-mint-dark/90 text-white",
                    )}
                    size="sm"
                  >
                    {step.action}
                    {!step.completed && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
