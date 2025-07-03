"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PinInput } from "@/components/pin-input"
import Link from "next/link"
import { verifyCode, resendVerificationCode } from "@/lib/api"

export default function VerifyCodePage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyCode(email, code)

      if (response.success) {
        if (response.isNewUser) {
          toast({
            title: "Account created!",
            description: "Welcome to SereneNow. Let's set up your profile.",
          })
          router.push("/onboarding/profile")
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in.",
          })
          router.push("/dashboard")
        }
      } else {
        toast({
          title: "Invalid code",
          description: "The code you entered is incorrect or has expired.",
          variant: "destructive",
        })
        setCode("")
      }
    } catch (error: any) {
      console.error("Verify code error:", error)
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to verify code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return

    setIsResending(true)

    try {
      const response = await resendVerificationCode(email)

      if (response.success) {
        toast({
          title: "Code sent!",
          description: `We've sent a new 6-digit code to ${email}`,
        })

        setResendTimer(60) // 60 second cooldown
      } else {
        throw new Error(response.message || "Failed to resend code")
      }
    } catch (error: any) {
      console.error("Resend code error:", error)
      toast({
        title: "Failed to resend",
        description: error.message || "Could not send a new code. Please try again.",
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
            {email ? (
              <>
                Enter the 6-digit code sent to <span className="font-medium text-mint-dark">{email}</span>
              </>
            ) : (
              "Enter the 6-digit code sent to your email"
            )}
          </p>
        </div>

        {/* Verification Form */}
        <Card className="border-mint/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-mint/10 rounded-full mx-auto">
              <span className="text-2xl">🔐</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-charcoal block text-center">Verification Code</label>
                <PinInput value={code} onChange={setCode} length={6} disabled={isLoading} />
              </div>

              <Button
                type="submit"
                className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                disabled={code.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || isResending}
                className="text-mint-dark hover:text-mint-dark/80 hover:bg-mint/10"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  "Didn't receive a code? Resend"
                )}
              </Button>

              <p className="text-xs text-charcoal/50">
                Wrong email?{" "}
                <Link href="/login" className="text-mint-dark hover:underline">
                  Go back
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Instructions */}
        <div className="mt-6 p-4 bg-mint/10 rounded-lg border border-mint/20">
          <p className="text-xs text-charcoal/70 text-center">
            <strong>Demo:</strong> Use code <code className="bg-mint/20 px-1 rounded">123456</code> for existing user or{" "}
            <code className="bg-mint/20 px-1 rounded">654321</code> for new user
          </p>
        </div>
      </div>
    </div>
  )
}
