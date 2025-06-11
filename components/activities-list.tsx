import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ActivitiesList({ data }: { data: any[] }) {
  // Filter days with activities
  const daysWithActivities = data.filter((day) => day.data?.activities?.length)

  if (daysWithActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No activities recorded for the selected period</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {daysWithActivities.map((day) => (
        <Card key={day.date}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">{format(new Date(day.date), "EEEE, MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex flex-wrap gap-2">
              {day.data.activities.map((activity: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {activity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
