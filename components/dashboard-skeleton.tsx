import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </header>
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-[200px] w-full" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
