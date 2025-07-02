"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { sendVerificationCode } from "@/lib/api/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await sendVerificationCode(email)

      if (response.success) {
        toast({
          title: "Code sent!",
          description: `We've sent a 6-digit code to ${email}`,
        })

        router.push(`/verify-code?email=${encodeURIComponent(email)}`)
      } else {
        throw new Error(response.message || "Failed to send code")
      }
    } catch (error: any) {
      console.error("Send code error:", error)
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
          <h1 className="text-2xl font-bold text-charcoal mb-2">Welcome to SereneNow</h1>
          <p className="text-charcoal/70 text-sm">
            Log in or sign up with your email. We'll send you a 6-digit code to continue.
          </p>
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
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                disabled={!email || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Login Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-charcoal/60">
                Already have a code?{" "}
                <Link href="/verify-code" className="text-mint-dark hover:text-mint-dark/80 font-medium">
                  Enter it here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-charcoal/50">
            By continuing, you agree to our{" "}
            <Link href="/terms-of-service" className="text-mint-dark hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-mint-dark hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
