// Script to add PINs to existing jobs in Firebase
// This will help you add PINs to your existing job documents

import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRM5eyHs10SbecXEQHgnpU_7-a-UMvUHc",
  authDomain: "airy-adapter-451212-b8.firebaseapp.com",
  projectId: "airy-adapter-451212-b8",
  storageBucket: "airy-adapter-451212-b8.firebasestorage.app",
  messagingSenderId: "17344691036",
  appId: "1:17344691036:web:6b3251d88a99d7e06cdf99",
  measurementId: "G-M0NM2HV8TG",
}

// Initialize Firebase - only initialize if no apps exist
let app
let db

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  db = getFirestore(app)
  console.log("Firestore initialized successfully")
} catch (error) {
  console.error("Error initializing Firestore:", error)
  console.log("Running in mock mode...")
}

// Function to generate a random 4-digit PIN
function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Function to add PINs to jobs
async function addPinsToJobs() {
  console.log("Fetching existing jobs...")

  try {
    if (!db) {
      console.error("Firestore is not initialized")
      console.log("Creating mock data instead...")
      createMockPins()
      return
    }

    const jobsRef = collection(db, "jobs")
    const querySnapshot = await getDocs(jobsRef)

    console.log(`Found ${querySnapshot.docs.length} jobs`)

    const usedPins = new Set()

    for (const jobDoc of querySnapshot.docs) {
      const jobData = jobDoc.data()

      // Skip if job already has a PIN
      if (jobData.pin) {
        console.log(`Job ${jobDoc.id} already has PIN: ${jobData.pin}`)
        usedPins.add(jobData.pin)
        continue
      }

      // Generate a unique PIN
      let newPin
      do {
        newPin = generatePin()
      } while (usedPins.has(newPin))

      usedPins.add(newPin)

      // Update the job document with the new PIN
      await updateDoc(doc(db, "jobs", jobDoc.id), {
        pin: newPin,
        updatedAt: new Date().toISOString(),
      })

      // Extract patient name from patientInfo object
      const patientName = jobData.patientInfo?.name || "Unknown Patient"
      const jobType = jobData.jobType || "Unknown Job"

      // Extract staff ID from staffInfo object
      let staffId = "No Staff"
      if (jobData.staffInfo && typeof jobData.staffInfo === "object") {
        staffId = jobData.staffInfo.staffId || "No Staff ID"
      }

      console.log(`✅ Added PIN ${newPin} to job ${jobDoc.id}`)
      console.log(`   Patient: ${patientName}`)
      console.log(`   Job Type: ${jobType}`)
      console.log(`   Staff ID: ${staffId}`)
      console.log(`   Status: ${jobData.status || "Unknown"}`)
      console.log("")
    }

    console.log("🎉 All jobs have been updated with PINs!")
    console.log("\nGenerated PINs Summary:")

    // Fetch updated jobs to show all PINs
    const updatedSnapshot = await getDocs(jobsRef)
    updatedSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.pin) {
        const patientName = data.patientInfo?.name || "Unknown Patient"
        const jobType = data.jobType || "Unknown Job"
        const status = data.status || "Unknown"

        console.log(`PIN ${data.pin}: ${patientName} (${jobType}) - ${status}`)
      }
    })
  } catch (error) {
    console.error("❌ Error adding PINs to jobs:", error)
    console.log("Creating mock data instead...")
    createMockPins()
  }
}

// Function to create mock PINs for testing
function createMockPins() {
  console.log("Creating mock PINs for testing...")

  const mockData = [
    {
      pin: "1234",
      patientName: "Margaret Johnson",
      jobType: "Senior Care Attendant",
      status: "ongoing",
    },
    {
      pin: "5678",
      patientName: "Robert Smith",
      jobType: "Medical Attendant",
      status: "ongoing",
    },
    {
      pin: "9999",
      patientName: "Eleanor Davis",
      jobType: "Nurse",
      status: "ongoing",
    },
  ]

  console.log("🎉 Mock PINs created successfully!")
  console.log("\nMock PINs Summary:")

  mockData.forEach((data) => {
    console.log(`PIN ${data.pin}: ${data.patientName} (${data.jobType}) - ${data.status}`)
  })
}

// Run the script
addPinsToJobs()
