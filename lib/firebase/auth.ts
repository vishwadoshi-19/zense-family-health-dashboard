import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, Firestore } from "firebase/firestore"

interface Job {
  id: string;
  pin?: string;
  [key: string]: any;
}

// Firebase configuration using your environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase - only initialize if no apps exist
let app
let db: Firestore

// Ensure Firebase is initialized only once
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firestore with error handling
try {
  db = getFirestore(app)
  console.log("Firestore initialized successfully")
} catch (error) {
  console.error("Error initializing Firestore:", error)
}

// Function to verify PIN and return job data
export async function verifyPin(pin: string): Promise<{ userId: string; jobData: any } | null> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      // Return mock data for testing when Firestore is unavailable
      return getMockPinData(pin)
    }

    // Query Firestore for a job with this PIN
    const jobsRef = collection(db, "jobs")
    const q = query(jobsRef, where("pin", "==", pin))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const jobDoc = querySnapshot.docs[0]
      const jobData = jobDoc.data()

      // Extract staffId from staffInfo object
      let staffId = ""
      try {
        if (jobData.staffInfo && typeof jobData.staffInfo === "object") {
          staffId = jobData.staffInfo.staffId || ""
        } else if (typeof jobData.staffInfo === "string") {
          // Fallback for string format (in case some are still strings)
          const staffIdMatch = jobData.staffInfo.match(/staffId:\s*"([^"]+)"/)
          if (staffIdMatch) {
            staffId = staffIdMatch[1]
          }
        }
      } catch (error) {
        console.error("Error parsing staffInfo:", error)
      }

      // Parse dates properly
      let startDate = jobData.startDate
      let endDate = jobData.endDate

      // Handle Firestore timestamp objects
      if (startDate && typeof startDate === "object" && startDate.toDate) {
        startDate = startDate.toDate().toISOString()
      } else if (startDate && typeof startDate === "object" && startDate.seconds) {
        startDate = new Date(startDate.seconds * 1000).toISOString()
      }

      if (endDate && typeof endDate === "object" && endDate.toDate) {
        endDate = endDate.toDate().toISOString()
      } else if (endDate && typeof endDate === "object" && endDate.seconds) {
        endDate = new Date(endDate.seconds * 1000).toISOString()
      }

      return {
        userId: staffId,
        jobData: {
          jobId: jobDoc.id,
          patientName: jobData.patientInfo?.name || "Unknown Patient",
          patientAge: jobData.patientInfo?.age || 0,
          patientGender: jobData.patientInfo?.gender || "",
          patientCity: jobData.patientInfo?.city || "",
          patientAddress: jobData.patientInfo?.address || "",
          patientMobile: jobData.patientInfo?.mobile || "",
          facility: "Zense Care Home", // You can modify this based on your data
          startDate: startDate,
          endDate: endDate,
          jobType: jobData.jobType,
          serviceType: jobData.serviceType,
          serviceShift: jobData.serviceShift,
          status: jobData.status,
          staffId: staffId,
          staffAssignedAt: jobData.staffInfo?.assignedAt || null,
        },
      }
    }

    // If no matching PIN found in Firestore, return mock data for testing
    return getMockPinData(pin)
  } catch (error) {
    console.error("Error verifying PIN:", error)
    // Return mock data as fallback when there's an error
    return getMockPinData(pin)
  }
}

// Function to add PIN to an existing job (for admin use)
export async function addPinToJob(jobId: string, pin: string) {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      return false
    }

    const jobRef = doc(db, "jobs", jobId)
    await updateDoc(jobRef, {
      pin: pin,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("Error adding PIN to job:", error)
    return false
  }
}

// Function to get all jobs without PINs (for admin use)
export async function getJobsWithoutPins() {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      return []
    }

    const jobsRef = collection(db, "jobs")
    const querySnapshot = await getDocs(jobsRef)

    const jobsWithoutPins = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Job))
      .filter((job) => !job.pin) // Filter jobs that don't have a PIN

    return jobsWithoutPins
  } catch (error) {
    console.error("Error fetching jobs without PINs:", error)
    return []
  }
}

// Function to get all jobs with PINs (for admin use)
export async function getAllJobsWithPins() {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      return []
    }

    const jobsRef = collection(db, "jobs")
    const querySnapshot = await getDocs(jobsRef)

    const jobsWithPins = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Job))
      .filter((job) => job.pin) // Filter jobs that have a PIN

    return jobsWithPins
  } catch (error) {
    console.error("Error fetching jobs with PINs:", error)
    return []
  }
}

// Mock data function for testing when Firestore is unavailable
function getMockPinData(pin: string): { userId: string; jobData: any } | null {
  // Demo PINs for testing
  const mockPins = {
    "1234": {
      userId: "demo-user-123",
      patientName: "Margaret Johnson",
      patientAge: 78,
      patientGender: "Female",
      patientCity: "New Delhi",
      patientAddress: "123 Green Park, New Delhi, 110016",
      patientMobile: "+91 98765 43210",
      facility: "Zense Care Home",
      startDate: "2025-06-05T00:00:00.000Z",
      endDate: "2025-06-10T00:00:00.000Z",
      jobType: "Senior Care Attendant",
      serviceType: "12 Hour Care",
      serviceShift: "Day Shift (7 AM - 7 PM)",
      status: "ongoing",
    },
    "5678": {
      userId: "demo-user-456",
      patientName: "Robert Smith",
      patientAge: 82,
      patientGender: "Male",
      patientCity: "Mumbai",
      patientAddress: "456 Sea View Apartments, Bandra, Mumbai, 400050",
      patientMobile: "+91 87654 32109",
      facility: "Zense Care Home",
      startDate: "2025-06-01T00:00:00.000Z",
      endDate: "2025-06-15T00:00:00.000Z",
      jobType: "Medical Attendant",
      serviceType: "24 Hour Care",
      serviceShift: "Full Day",
      status: "ongoing",
    },
    "9999": {
      userId: "demo-user-789",
      patientName: "Eleanor Davis",
      patientAge: 75,
      patientGender: "Female",
      patientCity: "Bangalore",
      patientAddress: "789 Jayanagar, Bangalore, 560041",
      patientMobile: "+91 76543 21098",
      facility: "Zense Care Home",
      startDate: "2025-05-20T00:00:00.000Z",
      endDate: "2025-06-20T00:00:00.000Z",
      jobType: "Nurse",
      serviceType: "8 Hour Care",
      serviceShift: "Morning Shift (8 AM - 4 PM)",
      status: "ongoing",
    },
  }

  // Check if the PIN exists in our mock data
  if (pin in mockPins) {
    const userData = mockPins[pin as keyof typeof mockPins]
    console.log("Using mock data for PIN:", pin)
    return {
      userId: userData.userId,
      jobData: {
        jobId: `mock-job-${pin}`,
        ...userData,
        staffId: userData.userId,
        staffAssignedAt: new Date().toISOString(),
      },
    }
  }

  // If PIN doesn't match any mock data, return null
  return null
}
