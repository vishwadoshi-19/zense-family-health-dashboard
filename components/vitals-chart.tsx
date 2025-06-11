"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function VitalsChart({ data }: { data: any[] }) {
  const [activeVital, setActiveVital] = useState("bloodPressure")

  // Process data for charts
  const chartData = data
    .map((day) => {
      if (!day.data || !day.data.vitalsHistory || day.data.vitalsHistory.length === 0) {
        return {
          date: format(new Date(day.date), "MMM dd"),
          bloodPressureSystolic: null,
          bloodPressureDiastolic: null,
          temperature: null,
          heartRate: null,
          oxygenLevel: null,
          bloodSugar: null,
        }
      }

      // Calculate averages for the day
      const vitals = day.data.vitalsHistory
      let systolicSum = 0,
        systolicCount = 0
      let diastolicSum = 0,
        diastolicCount = 0
      let tempSum = 0,
        tempCount = 0
      let hrSum = 0,
        hrCount = 0
      let o2Sum = 0,
        o2Count = 0
      let bsSum = 0,
        bsCount = 0

      vitals.forEach((vital: any) => {
        // Blood pressure
        if (vital.bloodPressure) {
          const [systolic, diastolic] = vital.bloodPressure.split("/").map(Number)
          if (!isNaN(systolic)) {
            systolicSum += systolic
            systolicCount++
          }
          if (!isNaN(diastolic)) {
            diastolicSum += diastolic
            diastolicCount++
          }
        }

        // Temperature
        if (vital.temperature) {
          const temp = Number.parseFloat(vital.temperature)
          if (!isNaN(temp)) {
            tempSum += temp
            tempCount++
          }
        }

        // Heart rate
        if (vital.heartRate) {
          const hr = Number.parseInt(vital.heartRate)
          if (!isNaN(hr)) {
            hrSum += hr
            hrCount++
          }
        }

        // Oxygen level
        if (vital.oxygenLevel) {
          const o2 = Number.parseInt(vital.oxygenLevel)
          if (!isNaN(o2)) {
            o2Sum += o2
            o2Count++
          }
        }

        // Blood sugar
        if (vital.bloodSugar) {
          const bs = Number.parseInt(vital.bloodSugar)
          if (!isNaN(bs)) {
            bsSum += bs
            bsCount++
          }
        }
      })

      return {
        date: format(new Date(day.date), "MMM dd"),
        bloodPressureSystolic: systolicCount > 0 ? Math.round(systolicSum / systolicCount) : null,
        bloodPressureDiastolic: diastolicCount > 0 ? Math.round(diastolicSum / diastolicCount) : null,
        temperature: tempCount > 0 ? (tempSum / tempCount).toFixed(1) : null,
        heartRate: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
        oxygenLevel: o2Count > 0 ? Math.round(o2Sum / o2Count) : null,
        bloodSugar: bsCount > 0 ? Math.round(bsSum / bsCount) : null,
      }
    })
    .filter((day) => {
      // Filter out days with no data for the active vital
      if (activeVital === "bloodPressure") {
        return day.bloodPressureSystolic !== null || day.bloodPressureDiastolic !== null
      }
      return day[activeVital as keyof typeof day] !== null
    })

  // Check if we have data for each vital type
  const hasBloodPressureData = data.some((day) => day.data?.vitalsHistory?.some((v: any) => v.bloodPressure))
  const hasTemperatureData = data.some((day) => day.data?.vitalsHistory?.some((v: any) => v.temperature))
  const hasHeartRateData = data.some((day) => day.data?.vitalsHistory?.some((v: any) => v.heartRate))
  const hasOxygenLevelData = data.some((day) => day.data?.vitalsHistory?.some((v: any) => v.oxygenLevel))
  const hasBloodSugarData = data.some((day) => day.data?.vitalsHistory?.some((v: any) => v.bloodSugar))

  const vitalTabs = [
    { id: "bloodPressure", label: "🩸 BP", fullLabel: "Blood Pressure", hasData: hasBloodPressureData },
    { id: "temperature", label: "🌡️ Temp", fullLabel: "Temperature", hasData: hasTemperatureData },
    { id: "heartRate", label: "💓 HR", fullLabel: "Heart Rate", hasData: hasHeartRateData },
    { id: "oxygenLevel", label: "🫁 O2", fullLabel: "Oxygen Level", hasData: hasOxygenLevelData },
    { id: "bloodSugar", label: "🍯 BS", fullLabel: "Blood Sugar", hasData: hasBloodSugarData },
  ].filter((tab) => tab.hasData)

  return (
    <Card className="border-teal-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-teal-900 flex items-center gap-2">📈<span className="px-0.5"></span>Vitals Trends</CardTitle>
        <CardDescription className="text-teal-600">Track changes in vital signs over time</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeVital} onValueChange={setActiveVital} className="w-full">
          <div className="px-6 pt-2">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-teal-50 p-1 text-teal-500 border border-teal-100 w-max">
                {vitalTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-teal-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <span className="hidden sm:inline">{tab.fullLabel}</span>
                    <span className="sm:hidden">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="p-6 pt-4">
            <TabsContent value="bloodPressure" className="mt-0">
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#0f766e" }} axisLine={{ stroke: "#0f766e" }} />
                    <YAxis
                      domain={[60, 160]}
                      tick={{ fontSize: 12, fill: "#0f766e" }}
                      axisLine={{ stroke: "#0f766e" }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "bloodPressureSystolic") return [value, "Systolic"]
                        if (name === "bloodPressureDiastolic") return [value, "Diastolic"]
                        return [value, name]
                      }}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #0f766e",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bloodPressureSystolic"
                      stroke="#dc2626"
                      name="Systolic"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#dc2626" }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="bloodPressureDiastolic"
                      stroke="#0f766e"
                      name="Diastolic"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#0f766e" }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="temperature" className="mt-0">
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#0f766e" }} axisLine={{ stroke: "#0f766e" }} />
                    <YAxis
                      domain={[96, 102]}
                      tick={{ fontSize: 12, fill: "#0f766e" }}
                      axisLine={{ stroke: "#0f766e" }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}°F`, "Temperature"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #0f766e",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f59e0b"
                      name="Temperature (°F)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#f59e0b" }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="heartRate" className="mt-0">
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#0f766e" }} axisLine={{ stroke: "#0f766e" }} />
                    <YAxis
                      domain={[40, 120]}
                      tick={{ fontSize: 12, fill: "#0f766e" }}
                      axisLine={{ stroke: "#0f766e" }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} bpm`, "Heart Rate"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #0f766e",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#ec4899"
                      name="Heart Rate (bpm)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ec4899" }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="oxygenLevel" className="mt-0">
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#0f766e" }} axisLine={{ stroke: "#0f766e" }} />
                    <YAxis
                      domain={[90, 100]}
                      tick={{ fontSize: 12, fill: "#0f766e" }}
                      axisLine={{ stroke: "#0f766e" }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Oxygen Level"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #0f766e",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="oxygenLevel"
                      stroke="#06b6d4"
                      name="Oxygen Level (%)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#06b6d4" }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="bloodSugar" className="mt-0">
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#0f766e" }} axisLine={{ stroke: "#0f766e" }} />
                    <YAxis
                      domain={[60, 200]}
                      tick={{ fontSize: 12, fill: "#0f766e" }}
                      axisLine={{ stroke: "#0f766e" }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} mg/dL`, "Blood Sugar"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #0f766e",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bloodSugar"
                      stroke="#8b5cf6"
                      name="Blood Sugar (mg/dL)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#8b5cf6" }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
