"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { validateClientCode } from "@/lib/services/client-code-service"
import { useClientData } from "@/hooks/use-client-data"

export default function BookingCodeEntry() {
  const [clientCode, setClientCode] = useState("")
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setClientResponseData } = useClientData()

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true)
    e.preventDefault()
    if (clientCode.length !== 6) return

    try {
      const result = await validateClientCode(clientCode)
      
      setLoading(false)
      // Store the client response data using our centralized approach
      setClientResponseData(result.clientResponse)

      // Check if client needs to complete profile setup
      if (!result.clientResponse.hasSetupProfile) {
        // Redirect to client registration
        router.push(`/book/register?code=${clientCode}`)
      } else {
        // Existing client with complete profile - check if multiple services
        if (result.services.length > 1) {
          // Multiple services - show service selection
          router.push(`/book/services?code=${clientCode}`)
        } else if (result.services.length === 1) {
          // Single service - go directly to booking
          router.push(`/book/${result.expert.id}/${result.services[0].id}?code=${clientCode}`)
        } else {
          setError("No services available for this code")
          console.error("No services available for this code")
        }
      }
    } catch (err) {
      // Error is handled by the hook
      console.error("Code validation failed:", err)
      setError("Code validation failed: " + err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-charcoal hover:text-mint-dark mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal mb-2">Book a Session</h1>
            <p className="text-charcoal/70">Enter your client code to get started</p>
          </div>
        </div>

        {/* Code Entry Form */}
        <div className="max-w-md mx-auto">
          <Card className="border-mint/20 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-mint-dark mb-4">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Client Code</span>
                  </div>

                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={clientCode}
                      onChange={(e) => setClientCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="flex-1 text-center text-lg tracking-widest border-mint/20 focus:border-mint-dark"
                      maxLength={6}
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      disabled={clientCode.length !== 6 || loading}
                      className="bg-mint-dark hover:bg-mint-dark/90 text-white px-6"
                    >
                      {loading ? "Validating..." : "Submit"}
                    </Button>
                  </div>
                </div>

                {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>}

                <p className="text-sm text-charcoal/60 text-center">
                  Your therapist will provide you with this 6-digit code
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
