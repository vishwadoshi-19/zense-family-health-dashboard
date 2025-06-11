"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Filter, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define normal ranges for vitals
const vitalRanges = {
  systolic: { min: 90, max: 140, unit: "mmHg" },
  diastolic: { min: 60, max: 90, unit: "mmHg" },
  temperature: { min: 97.0, max: 99.5, unit: "°F" },
  oxygenLevel: { min: 95, max: 100, unit: "%" },
  bloodSugar: { min: 70, max: 140, unit: "mg/dL" },
  heartRate: { min: 60, max: 100, unit: "bpm" },
}

export function VitalsAlerts({ data }: { data: any[] }) {
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  // Generate vitals alerts
  const vitalsAlerts = data.flatMap((day) => {
    try {
      if (!day.data?.vitalsHistory) return []

      const alerts: any[] = []

      day.data.vitalsHistory.forEach((entry: any) => {
        // Check blood pressure
        if (entry.bloodPressure) {
          const [systolic, diastolic] = entry.bloodPressure.split("/").map(Number)
          if (systolic && diastolic) {
            if (systolic > vitalRanges.systolic.max || systolic < vitalRanges.systolic.min) {
              alerts.push({
                date: day.date,
                time: entry.time,
                type: "Blood Pressure (Systolic)",
                value: `${systolic} mmHg`,
                status: systolic > vitalRanges.systolic.max ? "High" : "Low",
                severity: systolic > 160 || systolic < 80 ? "Critical" : "Warning",
                icon: "🩸",
              })
            }

            if (diastolic > vitalRanges.diastolic.max || diastolic < vitalRanges.diastolic.min) {
              alerts.push({
                date: day.date,
                time: entry.time,
                type: "Blood Pressure (Diastolic)",
                value: `${diastolic} mmHg`,
                status: diastolic > vitalRanges.diastolic.max ? "High" : "Low",
                severity: diastolic > 100 || diastolic < 50 ? "Critical" : "Warning",
                icon: "🩸",
              })
            }
          }
        }

        // Check temperature
        if (entry.temperature) {
          const temperature = Number.parseFloat(entry.temperature)
          if (
            !isNaN(temperature) &&
            (temperature > vitalRanges.temperature.max || temperature < vitalRanges.temperature.min)
          ) {
            alerts.push({
              date: day.date,
              time: entry.time,
              type: "Temperature",
              value: `${temperature}°F`,
              status: temperature > vitalRanges.temperature.max ? "High" : "Low",
              severity: temperature > 101 || temperature < 96 ? "Critical" : "Warning",
              icon: "🌡️",
            })
          }
        }

        // Check oxygen level
        if (entry.oxygenLevel) {
          const oxygenLevel = Number.parseInt(entry.oxygenLevel)
          if (!isNaN(oxygenLevel) && oxygenLevel < vitalRanges.oxygenLevel.min) {
            alerts.push({
              date: day.date,
              time: entry.time,
              type: "Oxygen Level",
              value: `${oxygenLevel}%`,
              status: "Low",
              severity: oxygenLevel < 90 ? "Critical" : "Warning",
              icon: "🫁",
            })
          }
        }

        // Check heart rate
        if (entry.heartRate) {
          const heartRate = Number.parseInt(entry.heartRate)
          if (!isNaN(heartRate) && (heartRate > vitalRanges.heartRate.max || heartRate < vitalRanges.heartRate.min)) {
            alerts.push({
              date: day.date,
              time: entry.time,
              type: "Heart Rate",
              value: `${heartRate} bpm`,
              status: heartRate > vitalRanges.heartRate.max ? "High" : "Low",
              severity: heartRate > 120 || heartRate < 50 ? "Critical" : "Warning",
              icon: "💓",
            })
          }
        }

        // Check blood sugar
        if (entry.bloodSugar) {
          const bloodSugar = Number.parseInt(entry.bloodSugar)
          if (
            !isNaN(bloodSugar) &&
            (bloodSugar > vitalRanges.bloodSugar.max || bloodSugar < vitalRanges.bloodSugar.min)
          ) {
            alerts.push({
              date: day.date,
              time: entry.time,
              type: "Blood Sugar",
              value: `${bloodSugar} mg/dL`,
              status: bloodSugar > vitalRanges.bloodSugar.max ? "High" : "Low",
              severity: bloodSugar > 180 || bloodSugar < 60 ? "Critical" : "Warning",
              icon: "🍯",
            })
          }
        }
      })

      return alerts
    } catch (error) {
      console.error("Error processing vitals alerts:", error)
      return []
    }
  })

  // Apply filters
  const filteredAlerts = vitalsAlerts.filter((alert) => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false
    if (filterType !== "all" && !alert.type.includes(filterType)) return false
    return true
  })

  // Get unique vital types for filter
  const vitalTypes = Array.from(new Set(vitalsAlerts.map((alert) => alert.type)))

  if (vitalsAlerts.length === 0) {
    return (
      <>
      <Card className="border-teal-100 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-teal-900">
            {/* <Heart className="h-5 w-5 text-teal-600" /> */}
            ⚠️<span className="px-0.5"></span>Vitals Alerts
          </CardTitle>
          <CardDescription className="text-teal-600">
            No vital sign alerts detected in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-teal-700 font-medium">All vital signs are within normal ranges</p>
            <p className="text-teal-600 text-sm mt-1">Great job maintaining healthy vitals!</p>
          </div>
        </CardContent>
      </Card>
      {/* Normal Ranges Reference */}
        
      <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <h4 className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
              📋 Normal Ranges Reference
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-teal-700">
              <div>
                🩸 Blood Pressure: {vitalRanges.systolic.min}-{vitalRanges.systolic.max}/{vitalRanges.diastolic.min}-
                {vitalRanges.diastolic.max} mmHg
              </div>
              <div>
                🌡️ Temperature: {vitalRanges.temperature.min}-{vitalRanges.temperature.max}°F
              </div>
              <div>🫁 Oxygen Level: ≥{vitalRanges.oxygenLevel.min}%</div>
              <div>
                💓 Heart Rate: {vitalRanges.heartRate.min}-{vitalRanges.heartRate.max} bpm
              </div>
              <div>
                🍯 Blood Sugar: {vitalRanges.bloodSugar.min}-{vitalRanges.bloodSugar.max} mg/dL
              </div>
            </div>
          </div>
      </>
    )
  }

  return (
    <Card className="border-teal-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-teal-900">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Vitals Alerts
        </CardTitle>
        <CardDescription className="text-teal-600">
          {vitalsAlerts.length} {vitalsAlerts.length === 1 ? "instance" : "instances"} where vital signs were outside
          normal ranges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 text-sm text-teal-700">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filter alerts:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="border-teal-200 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🔍 All Severities</SelectItem>
                <SelectItem value="Critical">🚨 Critical Only</SelectItem>
                <SelectItem value="Warning">⚠️ Warning Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="border-teal-200 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Vital Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📊 All Vitals</SelectItem>
                {vitalTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alerts List */}
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-3 pr-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🔍</span>
                </div>
                <p className="text-gray-600">No alerts match the selected filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${
                    alert.severity === "Critical"
                      ? "border-red-500 bg-red-50 hover:bg-red-100"
                      : "border-amber-500 bg-amber-50 hover:bg-amber-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{alert.icon}</span>
                        <h4 className="font-semibold text-sm text-gray-900">
                          {alert.type} - {alert.status}
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          📅 {new Date(alert.date).toLocaleDateString()} at 🕐 {alert.time}
                        </p>
                        <p className="text-gray-700">
                          📊 Value: <span className="font-semibold">{alert.value}</span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={alert.severity === "Critical" ? "destructive" : "outline"}
                      className={`shrink-0 ${
                        alert.severity === "Critical"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {alert.severity === "Critical" ? "🚨" : "⚠️"} {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Normal Ranges Reference */}
        
          <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <h4 className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
              📋 Normal Ranges Reference
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-teal-700">
              <div>
                🩸 Blood Pressure: {vitalRanges.systolic.min}-{vitalRanges.systolic.max}/{vitalRanges.diastolic.min}-
                {vitalRanges.diastolic.max} mmHg
              </div>
              <div>
                🌡️ Temperature: {vitalRanges.temperature.min}-{vitalRanges.temperature.max}°F
              </div>
              <div>🫁 Oxygen Level: ≥{vitalRanges.oxygenLevel.min}%</div>
              <div>
                💓 Heart Rate: {vitalRanges.heartRate.min}-{vitalRanges.heartRate.max} bpm
              </div>
              <div>
                🍯 Blood Sugar: {vitalRanges.bloodSugar.min}-{vitalRanges.bloodSugar.max} mg/dL
              </div>
            </div>
          </div>
       
      </CardContent>
    </Card>
  )
}
