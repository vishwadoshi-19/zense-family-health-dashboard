"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { verifyPin } from "@/lib/firebase/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield } from "lucide-react"

export function   PinEntryForm() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.length !== 4) {
      toast({
        title: "❌ Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyPin(pin)
      if (result && result.userId) {
        // Store the userId, PIN, and job data in sessionStorage
        sessionStorage.setItem("userId", result.userId)
        sessionStorage.setItem("pin", pin)
        sessionStorage.setItem("jobData", JSON.stringify(result.jobData))

        toast({
          title: "✅ Access Granted",
          description: `Welcome! Loading ${result.jobData.patientName}'s dashboard...`,
        })

        // Redirect to dashboard
        router.push(`/dashboard/${result.userId}`)
      } else {
        toast({
          title: "🚫 Access Denied",
          description: "Invalid PIN. Please check with your Zense representative.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("PIN verification error:", error)
      toast({
        title: "⚠️ Connection Error",
        description: "Failed to verify PIN. Using demo mode.",
        variant: "destructive",
      })

      // Use demo PIN as fallback
      const demoPin = "1234"
      try {
        const result = await verifyPin(demoPin)
        if (result && result.userId) {
          // Store the demo data in sessionStorage
          sessionStorage.setItem("userId", result.userId)
          sessionStorage.setItem("pin", demoPin)
          sessionStorage.setItem("jobData", JSON.stringify(result.jobData))

          toast({
            title: "🎭 Demo Mode Activated",
            description: "Using demo data for testing purposes.",
          })

          // Redirect to dashboard with demo data
          router.push(`/dashboard/${result.userId}`)
        }
      } catch (demoError) {
        console.error("Demo mode error:", demoError)
        toast({
          title: "💥 Critical Error",
          description: "Could not initialize application. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-0"> {/* Added padding for smaller screens */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="pin" className="sr-only">
            Security PIN
          </label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            className="text-center text-xl tracking-[0.5em] h-14 border-2 border-teal-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading || pin.length !== 4}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            <>
              <span className="mr-2">🚀</span>
              Access Dashboard
            </>
          )}
        </Button>
      </form>

      {/* Demo PINs Card */}
      <Card className="bg-teal-50/50 border-teal-200">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <h3 className="text-sm font-medium text-teal-900 flex items-center justify-center gap-2">
              <span>🎯</span>
              Demo PINs Available
            </h3>
            <div className="flex flex-wrap justify-center gap-2 px-2"> {/* Added horizontal padding */}
              <Badge
                variant="outline"
                className="bg-white border-teal-300 text-teal-700 hover:bg-teal-100 cursor-pointer transition-colors"
                onClick={() => setPin("1234")}
              >
                1234 - Margaret
              </Badge>
              <Badge
                variant="outline"
                className="bg-white border-teal-300 text-teal-700 hover:bg-teal-100 cursor-pointer transition-colors"
                onClick={() => setPin("5678")}
              >
                5678 - Robert
              </Badge>
              <Badge
                variant="outline"
                className="bg-white border-teal-300 text-teal-700 hover:bg-teal-100 cursor-pointer transition-colors"
                onClick={() => setPin("9999")}
              >
                9999 - Eleanor
              </Badge>
            </div>
            <p className="text-xs text-teal-600">Click on a demo PIN to try the dashboard</p>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <div className="text-xs text-teal-600 space-y-2 bg-teal-50/30 p-3 rounded-lg border border-teal-100">
        <p className="flex items-center gap-2">
          <span>ℹ️</span>
          Enter the 4-digit PIN provided by your Zense representative
        </p>
        <p className="flex items-center gap-2">
          <span>🔗</span>
          This PIN is linked to your specific care assignment
        </p>
      </div>
    </div>
  )
}
