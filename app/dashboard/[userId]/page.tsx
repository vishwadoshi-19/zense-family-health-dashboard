import { Suspense } from "react"
import { Dashboard } from "@/components/dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { PinProtected } from "@/components/pin-protected"

export default function DashboardPage({ params }: { params: { userId: string } }) {
  const { userId } = params

  return (
    <PinProtected>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard userId={userId} />
      </Suspense>
    </PinProtected>
  )
}
