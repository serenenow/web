"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Shield, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { verifyCode, sendVerificationCode, setAuthToken, setExpertData } from "@/lib/api/auth"
import { logger } from "@/lib/utils/logger"

export default function VerifyCodePage() {
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Check if searchParams exists before trying to access it
    if (!searchParams) return
    
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
      setShowEmailInput(false)
    } else {
      setShowEmailInput(true)
    }
  }, [searchParams])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    if (!code.trim()) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      })
      return
    }

    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyCode(email, code)

      // Store the access token and expert data
      setAuthToken(response.accessToken)
      setExpertData(response.expert)

      toast({
        title: "Login successful!",
        description: "Welcome to SereneNow.",
      })

      // Check if profile setup is needed
      logger.info("Has set profile "+ response.hasSetupProfile);
      if (response.hasSetupProfile) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding/profile")
      }
    } catch (error: any) {
      logger.error("Verify code error:", error)
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      await sendVerificationCode(email)

      toast({
        title: "Code sent!",
        description: "A new verification code has been sent to your email.",
      })
    } catch (error: any) {
      logger.error("Resend code error:", error)
      toast({
        title: "Failed to resend",
        description: error.message || "Failed to resend verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image src="/favicon.png" alt="SereneNow Logo" width={48} height={48} />
            <span className="text-3xl font-bold bg-gradient-to-r from-mint-dark to-indigo bg-clip-text text-transparent ml-3">
              SereneNow
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">Enter Verification Code</h1>
          <p className="text-charcoal/70 text-sm">
            {showEmailInput
              ? "Enter your email and the 6-digit code sent to you"
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Verification Form */}
        <Card className="border-mint/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-mint/10 rounded-full mx-auto">
              <Shield className="h-6 w-6 text-mint-dark" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {showEmailInput && (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-charcoal">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark pl-10"
                      disabled={isLoading || isResending}
                      autoComplete="email"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-charcoal">
                  Verification Code
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setCode(value)
                  }}
                  className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark text-center text-lg tracking-widest"
                  disabled={isLoading || isResending}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white"
                disabled={isLoading || isResending}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleResendCode}
                className="text-sm text-mint-dark hover:text-mint-dark/80 underline"
                disabled={isLoading || isResending}
              >
                {isResending ? "Sending..." : "Didn't receive the code? Resend"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-xs text-charcoal/50 hover:text-charcoal/70 underline"
            disabled={isLoading || isResending}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
