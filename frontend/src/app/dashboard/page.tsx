"use client"

import { useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { QueryErrorBoundary } from "@/components/ErrorBoundary"
import { DashboardSkeleton } from "@/components/LoadingFallback"
import { DashboardContent } from "@/components/dashboard/DashboardContent"

export default function Dashboard() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (typeof window === "undefined") return

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  // Show loading state during SSR or before client hydration
  if (!isClient) {
    return <DashboardSkeleton />
  }

  return (
    <QueryErrorBoundary
      onReset={() => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("access_token")
          if (!token) {
            window.location.href = "/login"
          }
        }
      }}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </QueryErrorBoundary>
  )
}
