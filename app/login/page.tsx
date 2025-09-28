"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { sendVerificationCode, getAuthToken, getExpertData, validateAuthToken } from "@/lib/api/auth"
import { logger } from "@/lib/utils/logger"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = getAuthToken()
        const expertData = getExpertData()

        if (token && expertData) {
          // Validate if the token is still valid
          const isValid = await validateAuthToken()
          if (isValid) {
            // Token is valid, redirect to dashboard
            router.push("/dashboard")
            return
          } else {
            // Token is invalid, clear storage and show error
            const { removeAuthToken } = await import("@/lib/api/auth")
            removeAuthToken()
            setErrorMessage("Your session has expired. Please log in again.")
          }
        }
      } catch (error) {
        logger.error("Auth check error:", error)
        // Continue to login page on error
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkExistingAuth()
  }, [router])

  // Check for error message in URL parameters and display it
  useEffect(() => {
    if (!searchParams) return
    
    const urlErrorMessage = searchParams.get("error")
    if (urlErrorMessage) {
      setErrorMessage(decodeURIComponent(urlErrorMessage))
      
      // Clean up the URL by removing the error parameter
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.pathname)
    }
  }, [searchParams])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear any existing error message
    setErrorMessage("")

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.")
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.")
      return
    }

    setIsLoading(true)

    try {
      await sendVerificationCode(email)

      // Success - no need to show error message

      // Navigate to verify code page with email parameter
      router.push(`/verify-code?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      logger.error("Send verification code error:", error)
      setErrorMessage(error.message || "Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterCodeClick = () => {
    if (email.trim() && validateEmail(email)) {
      // If valid email is entered, navigate with email
      router.push(`/verify-code?email=${encodeURIComponent(email)}`)
    } else {
      // If no valid email, navigate without email (user will need to enter it)
      router.push("/verify-code")
    }
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-mint-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal/70">Checking authentication...</p>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-charcoal mb-2">Welcome</h1>
          <p className="text-charcoal/70 text-sm">Enter your email to receive a verification code</p>
        </div>

        {/* Login Form */}
        <Card className="border-mint/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-mint/10 rounded-full mx-auto">
              <Mail className="h-6 w-6 text-mint-dark" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-charcoal">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    // Clear error message when user starts typing
                    if (errorMessage) setErrorMessage("")
                  }}
                  className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                  disabled={isLoading}
                  autoComplete="email"
                />
                
                {/* Error message display */}
                {errorMessage && (
                  <p className="text-sm text-red-600 mt-2">
                    {errorMessage}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleEnterCodeClick}
                className="text-sm text-mint-dark hover:text-mint-dark/80 underline"
                disabled={isLoading}
              >
                Already have a code? Enter here
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-charcoal/50">
            By continuing, you agree to our{" "}
            <Link 
              href="/terms-of-service" 
              className="text-mint-dark hover:text-mint-dark/80 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link 
              href="/privacy-policy" 
              className="text-mint-dark hover:text-mint-dark/80 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
