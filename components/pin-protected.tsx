"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PinEntryForm } from "@/components/pin-entry-form"

export function PinProtected({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if userId and PIN exist in sessionStorage
    const userId = sessionStorage.getItem("userId")
    const pin = sessionStorage.getItem("pin")

    if (userId && pin) {
      setIsAuthenticated(true)
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b">
          <div className="container mx-auto py-4 px-4 md:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Family Health Dashboard</h1>
            <p className="text-gray-500">Authentication Required</p>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-center">Enter PIN to Access Dashboard</h2>
              <PinEntryForm />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return <>{children}</>
}
