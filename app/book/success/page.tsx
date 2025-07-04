"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const appointmentId = searchParams.get("appointmentId")
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Payment Successful!</h2>
          <p className="text-gray-500 mt-2">
            Your payment has been processed successfully. You will receive a confirmation email shortly.
          </p>
          
          <div className="w-full mt-6 border-t border-gray-200 pt-6">
            <div className="space-y-3">
              {orderId && (
                <div>
                  <span className="text-sm text-gray-500">Order ID:</span>
                  <p className="font-medium">{orderId}</p>
                </div>
              )}
              {appointmentId && (
                <div>
                  <span className="text-sm text-gray-500">Appointment ID:</span>
                  <p className="font-medium">{appointmentId}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 space-x-4">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
