import { Suspense } from "react"
import { Dashboard } from "@/components/dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { PinProtected } from "@/components/pin-protected"

export default async function DashboardPage({ params }: { params: { userId: string } }) {
  const { userId } = await params

  return (
    <PinProtected>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard userId={userId} />
      </Suspense>
    </PinProtected>
  )
}
