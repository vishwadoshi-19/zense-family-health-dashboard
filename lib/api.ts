import { format, addDays, differenceInDays } from "date-fns"

// Function to fetch health data from the API
export async function fetchHealthData(userId: string, startDate: string, endDate: string) {
  try {
    console.log("Fetching health data for:", { userId, startDate, endDate })

    const apiUrl = `https://zense-staff.vercel.app/api/tasks/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
    console.log("API URL:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any required headers here
      },
      // Add timeout and other fetch options
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", errorText)
      
      // If it's a 404 error, return mock data instead of throwing
      // if (response.status === 404) {
      //   console.log("404 error encountered, returning mock data")
      //   return getMockHealthData(userId, startDate, endDate)
      // }
      
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("API Response data:", data)

    if (!data.success) {
      console.error("API returned unsuccessful response:", data)
      throw new Error("API returned unsuccessful response")
    }

    // Get job data from session storage
    const jobDataStr = sessionStorage.getItem("jobData")
    let jobData = {}

    if (jobDataStr) {
      try {
        const parsedJobData = JSON.parse(jobDataStr)
        jobData = {
          patientName: parsedJobData.patientName,
          patientAge: parsedJobData.patientAge,
          facility: parsedJobData.facility,
          patientGender: parsedJobData?.patientGender ,
          patientCity: parsedJobData.patientCity,
          patientAddress: parsedJobData.patientAddress,
          patientMobile: parsedJobData.patientMobile,
          jobType: parsedJobData.jobType,
          serviceType: parsedJobData.serviceType,
          serviceShift: parsedJobData.serviceShift,
          status: parsedJobData.status,
          staffAssignedAt: parsedJobData.staffAssignedAt,
        }
      } catch (error) {
        console.error("Error parsing job data:", error)
      }
    }

    return {
      ...jobData,
      lastUpdated: new Date().toISOString(),
      data: data.data || [], // Ensure data is always an array
    }
  } catch (error) {
    console.error("Error fetching health data:", error)

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the health data API. Please check your internet connection.")
    }
    // Check if it's a timeout error
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: The API took too long to respond. Please try again.")
    }

    // Re-throw the original error
    throw error
  }
}

// Enhanced mock data generator with comprehensive daily data
export async function getMockHealthData(userId: string, startDate: string, endDate: string) {
  console.log("Generating comprehensive mock data for:", { userId, startDate, endDate })

  // Get job data from session storage
  const jobDataStr = sessionStorage.getItem("jobData")
  let jobData = {
    patientName: "Margaret Johnson",
    patientAge: 78,
    facility: "Zense Care Home",
    patientGender: "Female",
    patientCity: "New Delhi",
    patientAddress: "123 Green Park, New Delhi, 110016",
    patientMobile: "+91 98765 43210",
    jobType: "Senior Care Attendant",
    serviceType: "12 Hour Care",
    serviceShift: "Day Shift (7 AM - 7 PM)",
    status: "ongoing",
    staffAssignedAt: "2025-06-01T00:00:00.000Z",
  }

  if (jobDataStr) {
    try {
      const parsedJobData = JSON.parse(jobDataStr)
      jobData = { ...jobData, ...parsedJobData }
    } catch (error) {
      console.error("Error parsing job data:", error)
    }
  }

  // Calculate the number of days between start and end dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDifference = differenceInDays(end, start)

  // Arrays for realistic variations
  const moods = [
    "Cheerful",
    "Calm",
    "Excited",
    "Tense",
    "Fearful",
    "Angry",
  ]
  const activities = [
    "Morning walk in garden",
    "Reading newspaper",
    "Watching TV",
    "Light stretching exercises",
    "Listening to classical music",
    "Playing cards with family",
    "Afternoon nap",
    "Meditation and breathing exercises",
    "Physiotherapy session",
    "Video call with grandchildren",
    "Gardening (watering plants)",
    "Arts and crafts",
    "Puzzle solving",
    "Light cooking assistance",
    "Social interaction with neighbors",
    "Memory exercises",
    "Gentle yoga",
    "Bird watching",
    "Writing in journal",
    "Organizing photo albums",
  ]

  // Generate detailed data for each day
  const mockData = []

  for (let i = 0; i <= daysDifference; i++) {
    const currentDate = addDays(start, i)
    const dateString = format(currentDate, "yyyy-MM-dd")
    const dayOfWeek = format(currentDate, "EEEE")

    // Generate realistic variations based on day patterns
    const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday"
    const dayIndex = i % 7 // For creating weekly patterns

    // Base vitals with realistic variations
    const baseSystolic = 118 + Math.sin(i * 0.3) * 8 + (Math.random() - 0.5) * 6
    const baseDiastolic = 76 + Math.sin(i * 0.3) * 4 + (Math.random() - 0.5) * 4
    const baseHeartRate = 68 + Math.sin(i * 0.2) * 6 + (Math.random() - 0.5) * 8
    const baseTemp = 98.2 + (Math.random() - 0.5) * 1.2
    const baseOxygen = 97 + Math.random() * 2
    const baseBloodSugar = 95 + Math.sin(i * 0.4) * 15 + (Math.random() - 0.5) * 10

    // Generate 3-5 vitals readings per day
    const vitalsCount = 3 + Math.floor(Math.random() * 3)
    const vitalsHistory = []

    for (let v = 0; v < vitalsCount; v++) {
      const hour = 7 + v * 4 + Math.floor(Math.random() * 2)
      const minute = Math.floor(Math.random() * 60)
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      // Add some variation throughout the day
      const timeVariation = v * 0.1
      const systolic = Math.round(baseSystolic + (Math.random() - 0.5) * 4 + timeVariation)
      const diastolic = Math.round(baseDiastolic + (Math.random() - 0.5) * 3 + timeVariation)
      const heartRate = Math.round(baseHeartRate + (Math.random() - 0.5) * 5)
      const temperature = (baseTemp + (Math.random() - 0.5) * 0.4).toFixed(1)
      const oxygenLevel = Math.round(baseOxygen + (Math.random() - 0.5) * 1)
      const bloodSugar = Math.round(baseBloodSugar + (Math.random() - 0.5) * 8)

      vitalsHistory.push({
        time: time,
        bloodPressure: `${Math.max(0, Math.min(1000, systolic))}/${Math.max(0, Math.min(1000, diastolic))}`,
        heartRate: Math.max(0, Math.min(1000, heartRate)).toString(),
        temperature: Math.max(0.0, Math.min(1000.0, Number.parseFloat(temperature))).toFixed(1),
        oxygenLevel: Math.max(0, Math.min(1000, oxygenLevel)).toString(),
        bloodSugar: Math.max(70, Math.min(1000, bloodSugar)).toString(),
      })
    }

    // Generate 2-4 mood entries per day
    const moodCount = 2 + Math.floor(Math.random() * 3)
    const moodHistory = []

    for (let m = 0; m < moodCount; m++) {
      const hour = 8 + m * 4 + Math.floor(Math.random() * 2)
      const minute = Math.floor(Math.random() * 60)
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      // Mood tends to be better on weekends and varies by time of day
      let moodIndex
      if (isWeekend) {
        moodIndex = Math.floor(Math.random() * 4) // More positive moods
      } else if (hour < 12) {
        moodIndex = Math.floor(Math.random() * 6) // Morning moods
      } else {
        moodIndex = Math.floor(Math.random() * moods.length) // All moods possible
      }

      moodHistory.push({
        mood: moods[moodIndex],
        time: time,
        notes: hour < 12 ? "Morning assessment" : hour < 17 ? "Afternoon check" : "Evening evaluation",
      })
    }

    // Generate diet compliance (varies by day)
    const dietCompliance = {
      breakfast: Math.random() > (isWeekend ? 0.1 : 0.15), // Better compliance on weekends
      lunch: Math.random() > 0.1,
      dinner: Math.random() > 0.05,
      snacks: Math.random() > (dayIndex % 3 === 0 ? 0.3 : 0.5), // Varies by day pattern
    }

    // Add detailed meal information
    const mealDetails = {
      breakfast: dietCompliance.breakfast
        ? {
            items: ["Oatmeal with fruits", "Green tea", "Whole grain toast"],
            time: "08:30",
            notes: "Patient enjoyed the meal, good appetite",
          }
        : {
            items: ["Partial - only had tea"],
            time: "09:15",
            notes: "Reduced appetite this morning",
          },
      lunch: dietCompliance.lunch
        ? {
            items: ["Dal rice", "Mixed vegetables", "Yogurt", "Chapati"],
            time: "13:00",
            notes: "Complete meal consumed, patient satisfied",
          }
        : {
            items: ["Light soup", "Crackers"],
            time: "13:30",
            notes: "Preferred lighter meal today",
          },
      dinner: dietCompliance.dinner
        ? {
            items: ["Khichdi", "Steamed vegetables", "Buttermilk"],
            time: "19:30",
            notes: "Easy to digest dinner, well received",
          }
        : {
            items: ["Milk", "Biscuits"],
            time: "20:00",
            notes: "Light dinner as requested",
          },
      snacks: dietCompliance.snacks
        ? {
            items: ["Fresh fruits", "Nuts", "Herbal tea"],
            time: "16:00",
            notes: "Healthy snacking between meals",
          }
        : null,
    }

    // Generate 3-6 activities per day
    const activityCount = 3 + Math.floor(Math.random() * 4)
    const dailyActivities = []
    const usedActivities = new Set()

    for (let a = 0; a < activityCount; a++) {
      let activity
      do {
        activity = activities[Math.floor(Math.random() * activities.length)]
      } while (usedActivities.has(activity) && usedActivities.size < activities.length)

      usedActivities.add(activity)

      const hour = 9 + a * 2 + Math.floor(Math.random() * 2)
      const minute = Math.floor(Math.random() * 60)
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      dailyActivities.push({
        activity: activity,
        time: time,
        duration: `${15 + Math.floor(Math.random() * 45)} minutes`,
        notes: `Patient ${["actively participated", "enjoyed the activity", "showed interest", "completed successfully", "engaged well"][Math.floor(Math.random() * 5)]}`,
      })
    }

    // Add medication tracking
    const medications = [
      { name: "Amlodipine 5mg", time: "08:00", taken: Math.random() > 0.05, purpose: "Blood pressure" },
      { name: "Metformin 500mg", time: "08:00", taken: Math.random() > 0.1, purpose: "Diabetes" },
      { name: "Vitamin D3", time: "12:00", taken: Math.random() > 0.15, purpose: "Bone health" },
      { name: "Omega-3", time: "19:00", taken: Math.random() > 0.2, purpose: "Heart health" },
    ]

    // Add sleep tracking
    const sleepData = {
      bedtime: "22:30",
      wakeupTime: "06:45",
      sleepQuality: ["Excellent", "Good", "Fair", "Poor"][Math.floor(Math.random() * 4)],
      nightWakeups: Math.floor(Math.random() * 3),
      totalSleepHours: 7.5 + (Math.random() - 0.5) * 2,
      notes: "Patient reported feeling rested" + (Math.random() > 0.7 ? " but had some difficulty falling asleep" : ""),
    }

    // Add symptoms/observations
    const symptoms = []
    if (Math.random() > 0.8) symptoms.push("Mild joint stiffness in morning")
    if (Math.random() > 0.9) symptoms.push("Occasional shortness of breath")
    if (Math.random() > 0.85) symptoms.push("Good cognitive function")
    if (Math.random() > 0.7) symptoms.push("Stable mobility")

    mockData.push({
      date: dateString,
      dayOfWeek: dayOfWeek,
      data: {
        vitalsHistory: vitalsHistory,
        moodHistory: moodHistory,
        diet: dietCompliance,
        mealDetails: mealDetails,
        activities: dailyActivities.map((a) => a.activity), // For backward compatibility
        detailedActivities: dailyActivities,
        medications: medications,
        sleepData: sleepData,
        symptoms: symptoms,
        staffNotes: [
          {
            time: "09:00",
            note: `Daily assessment completed. Patient appears ${moods[Math.floor(Math.random() * 8)]?.toLowerCase()} and cooperative.`,
            staff: "Nurse Sarah",
          },
          {
            time: "15:00",
            note: `Afternoon check - vitals stable, patient engaged in ${dailyActivities[0]?.activity || "activities"}.`,
            staff: "Attendant Raj",
          },
          {
            time: "20:00",
            note: `Evening summary - overall good day, patient comfortable and settled for night.`,
            staff: "Nurse Sarah",
          },
        ],
        emergencyEvents:
          Math.random() > 0.95
            ? [
                {
                  time: "14:30",
                  event: "Minor fall while walking - no injuries, vitals checked",
                  action: "Increased supervision, family notified",
                  resolved: true,
                },
              ]
            : [],
        familyInteractions:
          Math.random() > 0.6
            ? [
                {
                  time: "16:00",
                  type: "Video call",
                  duration: "30 minutes",
                  participants: ["Daughter", "Son-in-law", "Grandchildren"],
                  notes: "Patient very happy after call, mood improved significantly",
                },
              ]
            : [],
        weatherImpact: {
          weather: ["Sunny", "Cloudy", "Rainy", "Pleasant"][Math.floor(Math.random() * 4)],
          impact: "No significant impact on activities",
          adjustments: Math.random() > 0.8 ? "Indoor activities preferred due to weather" : "Normal routine maintained",
        },
      },
    })
  }

  console.log("mockdataaaaaaaa: " , mockData);

  return {
    ...jobData,
    lastUpdated: new Date().toISOString(),
    totalDays: daysDifference + 1,
    dataCompleteness: "100% - Comprehensive mock data",
    data: mockData,
  }
}
