"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, RotateCcw, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type SectionVisibility = {
  patientInfo: boolean
  vitalsChart: boolean
  moodChart: boolean
  vitalsAlerts: boolean
  dietSummary: boolean
  detailedData: boolean
}

interface SectionVisibilityProps {
  visibility: SectionVisibility
  onChange: (visibility: SectionVisibility) => void
}

export function SectionVisibility({ visibility, onChange }: SectionVisibilityProps) {
  const toggleSection = (section: keyof SectionVisibility) => {
    onChange({
      ...visibility,
      [section]: !visibility[section],
    })
  }

  const resetToDefault = () => {
    onChange({
      patientInfo: true,
      vitalsChart: true,
      moodChart: true,
      vitalsAlerts: true,
      dietSummary: false,
      detailedData: false,
    })
  }

  const toggleAll = (value: boolean) => {
    const newVisibility = Object.keys(visibility).reduce(
      (acc, key) => ({
        ...acc,
        [key]: value,
      }),
      {} as SectionVisibility,
    )
    onChange(newVisibility)
  }

  const allVisible = Object.values(visibility).every(Boolean)
  const allHidden = Object.values(visibility).every((v) => !v)
  const visibleCount = Object.values(visibility).filter(Boolean).length

  const sections = [
    { key: "patientInfo", label: "Patient Info", icon: "👤" },
    { key: "vitalsChart", label: "Vitals Charts", icon: "📈" },
    { key: "moodChart", label: "Mood Distribution", icon: "😊" },
    { key: "vitalsAlerts", label: "Vitals Alerts", icon: "⚠️" },
    { key: "dietSummary", label: "Diet Summary", icon: "🍽️" },
    { key: "detailedData", label: "Detailed Data", icon: "📊" },
  ]

  return (
    <Card className="border-teal-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <Settings className="h-5 w-5" />
              <span className="px-0.5"></span>Dashboard Sections
            </CardTitle>
            <CardDescription className="text-teal-600 mt-1">
              Choose which sections to display on the dashboard
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-teal-50 border-teal-200 text-teal-700">
              {visibleCount} of {sections.length} visible
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAll(true)}
            disabled={allVisible}
            className="border-teal-200 text-teal-700 hover:bg-teal-50 flex-1 sm:flex-none"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Show All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAll(false)}
            disabled={allHidden}
            className="border-teal-200 text-teal-700 hover:bg-teal-50 flex-1 sm:flex-none"
          >
            <EyeOff className="h-3.5 w-3.5 mr-1" />Hide All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="border-teal-200 text-teal-700 hover:bg-teal-50 flex-1 sm:flex-none"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />Reset
          </Button>
        </div>

        {/* Section Toggles */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((section) => (
            <div
              key={section.key}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                visibility[section.key as keyof SectionVisibility]
                  ? "bg-teal-50 border-teal-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-md">{section.icon}</span>
                <Label
                  htmlFor={section.key}
                  className={`text-xs font-medium cursor-pointer ${
                    visibility[section.key as keyof SectionVisibility] ? "text-teal-900" : "text-gray-600"
                  }`}
                >
                  {section.label}
                </Label>
              </div>
              <Switch
                id={section.key}
                checked={visibility[section.key as keyof SectionVisibility]}
                onCheckedChange={() => toggleSection(section.key as keyof SectionVisibility)}
                className="data-[state=checked]:bg-teal-700"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
