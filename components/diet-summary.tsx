import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

export function DietSummary({ data }: { data: any[] }) {
  // Filter days with diet data
  const daysWithDietData = data.filter((day) => day.data?.diet)

  if (daysWithDietData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🍽️<span className="px-0.5"></span>Diet Summary</CardTitle>
          <CardDescription>No diet data available for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No diet information recorded</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🍽️<span className="px-2"></span>Diet Summary</CardTitle>
        <CardDescription>Meal completion status for each day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daysWithDietData.map((day) => (
            <Card key={day.date}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">{format(new Date(day.date), "EEEE, MMMM d")}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    {day.data.diet.breakfast ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Breakfast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.data.diet.lunch ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Lunch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.data.diet.dinner ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Dinner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.data.diet.snacks ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Snacks</span>
                  </div>
                </div>

                {/* Calculate compliance percentage */}
                {(() => {
                  const diet = day.data.diet
                  const total = Object.keys(diet).length
                  const completed = Object.values(diet).filter(Boolean).length
                  const percentage = Math.round((completed / total) * 100)

                  let color = "bg-red-100 text-red-800"
                  if (percentage >= 75) color = "bg-green-100 text-green-800"
                  else if (percentage >= 50) color = "bg-yellow-100 text-yellow-800"

                  return (
                    <div className="mt-2 text-right">
                      <Badge className={color}>{percentage}% completed</Badge>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
