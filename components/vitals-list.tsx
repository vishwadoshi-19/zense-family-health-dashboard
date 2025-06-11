import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function VitalsList({ data }: { data: any[] }) {
  // Filter days with vitals data
  const daysWithVitals = data.filter((day) => day.data?.vitalsHistory?.length)

  if (daysWithVitals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No vitals recorded for the selected period</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {daysWithVitals.map((day) => (
        <Card key={day.date}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">{format(new Date(day.date), "EEEE, MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Blood Pressure</TableHead>
                  <TableHead>Heart Rate</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Oxygen</TableHead>
                  <TableHead>Blood Sugar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {day.data.vitalsHistory.map((vital: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{vital.time}</TableCell>
                    <TableCell>{vital.bloodPressure || "—"}</TableCell>
                    <TableCell>{vital.heartRate || "—"}</TableCell>
                    <TableCell>{vital.temperature || "—"}</TableCell>
                    <TableCell>{vital.oxygenLevel || "—"}</TableCell>
                    <TableCell>{vital.bloodSugar || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
