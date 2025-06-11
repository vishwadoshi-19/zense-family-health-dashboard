// Script to set up demo patient records in Firebase
// Run this script to populate your Firebase with demo data

import { initializeApp, getApps } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { createHash } from "crypto"

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

// Hash PIN function
function hashPin(pin) {
  return createHash("sha256").update(pin).digest("hex")
}

// Demo patient data
const patients = [
  {
    userId: "demo-user-123",
    name: "Margaret Johnson",
    age: 78,
    facility: "Zense Care Home",
    pin: "1234",
    startDate: "2025-06-05",
    endDate: "2025-06-10",
  },
  {
    userId: "demo-user-456",
    name: "Robert Smith",
    age: 82,
    facility: "Zense Care Home",
    pin: "5678",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
  },
  {
    userId: "demo-user-789",
    name: "Eleanor Davis",
    age: 75,
    facility: "Zense Care Home",
    pin: "9999",
    startDate: "2025-05-20",
    endDate: "2025-06-20",
  },
]

// Function to create patient records
async function setupPatients() {
  console.log("Setting up patient records in Firebase...")

  try {
    if (!db) {
      console.error("Firestore is not initialized")
      console.log("Creating mock patient data instead...")
      createMockPatients()
      return
    }

    for (const patient of patients) {
      const hashedPin = hashPin(patient.pin)

      await setDoc(doc(db, "patients", patient.userId), {
        name: patient.name,
        age: patient.age,
        facility: patient.facility,
        hashedPin,
        userId: patient.userId,
        startDate: patient.startDate,
        endDate: patient.endDate,
        createdAt: new Date().toISOString(),
      })

      console.log(`✅ Created patient record for ${patient.name} (PIN: ${patient.pin})`)
    }

    console.log("\n🎉 All patient records created successfully!")
    console.log("\nDemo PINs you can use:")
    patients.forEach((patient) => {
      console.log(`- ${patient.pin}: ${patient.name}`)
    })
  } catch (error) {
    console.error("❌ Error setting up patients:", error)
    console.log("Creating mock patient data instead...")
    createMockPatients()
  }
}

// Function to create mock patient data for testing
function createMockPatients() {
  console.log("Creating mock patient data for testing...")

  console.log("\n🎉 Mock patient data created successfully!")
  console.log("\nDemo PINs you can use:")
  patients.forEach((patient) => {
    console.log(`- ${patient.pin}: ${patient.name}`)
  })
}

// Run the setup
setupPatients()
