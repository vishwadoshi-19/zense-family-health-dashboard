import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isValid, parseISO } from "date-fns"

export function PatientInfo({ patientData }: { patientData: any }) {
  // Helper function to safely format dates
  const safeFormatDate = (dateValue: any): string => {
    if (!dateValue) return "Not specified"

    try {
      // Handle different date formats
      let date
      if (typeof dateValue === "string") {
        date = parseISO(dateValue)
      } else if (dateValue instanceof Date) {
        date = dateValue
      } else if (typeof dateValue === "object" && dateValue.seconds) {
        // Handle Firestore timestamp
        date = new Date(dateValue.seconds * 1000)
      } else {
        date = new Date(dateValue)
      }

      return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date"
    } catch (error) {
      console.error("Date formatting error:", error, dateValue)
      return "Invalid date"
    }
  }

  const infoItems = [
    { label: "Patient Name", value: patientData.patientName || "Unknown", icon: "👤" },
    {
      label: "Age",
      value: `${patientData.patientAge || "Not specified"}${patientData.patientAge ? " years" : ""}`,
      icon: "🎂",
    },
    { label: "Gender", value: patientData.patientGender || "Not specified", icon: "⚧️" },
    { label: "Location", value: patientData.patientCity || "Not specified", icon: "📍" },
    
  ]
  {/*
  { label: "Mobile", value: patientData.patientMobile || "Not specified", icon: "📱" },
    { label: "Job Type", value: patientData.jobType || "Not specified", icon: "💼", isBadge: true },
    { label: "Service Type", value: patientData.serviceType || "Not specified", icon: "🏥", isBadge: true },
    { label: "Shift", value: patientData.serviceShift || "Not specified", icon: "🕐", isBadge: true },
    { label: "Status", value: patientData.status || "Unknown", icon: "📊", isBadge: true, isStatus: true },
    { label: "Staff Assigned", value: safeFormatDate(patientData.staffAssignedAt), icon: "📅" },
  */}

  return (
    <Card className="border-teal-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-teal-900 flex items-center gap-2 pb-4">👤<span className="px-0.5"></span>Patient & Job Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {infoItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                {/* <span className="text-lg">{item.icon}</span> */}
                <p className="text-sm font-medium text-teal-600">{item.label}</p>
              </div>
              <div>
                  <p className="font-medium text-teal-900 text-sm break-words">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/*{patientData.patientAddress && (
          <div className="mt-6 pt-4 border-t border-teal-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏠</span>
              <p className="text-sm font-medium text-teal-600">Address</p>
            </div>
            <p className="font-medium text-teal-900 text-sm pl-7 break-words">{patientData.patientAddress}</p>
          </div>
        )}*/}
      </CardContent>
    </Card>
  )
}
