import { PinEntryForm } from "@/components/pin-entry-form"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* <header className="bg-white/80 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 md:px-6 mobile-safe-area">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-teal-900 mb-2">Zense Health Dashboard</h1>
            <p className="text-teal-600 text-sm md:text-base">Monitor health data for your loved ones</p>
          </div>
        </div>
      </header> */}

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-sm sm:max-w-md"> {/* Adjusted max-width for smaller screens */}
          <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-teal-100 mx-auto"> {/* Added mx-auto for centering */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Adjusted logo size for smaller screens */}
                <img src="/icon.png" alt="Zense Health Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" /> {/* Adjusted logo image size */}
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-teal-900 mb-2">Zense Health Dashboard</h2>
              <p className="text-teal-600 text-sm">Enter your PIN to access the dashboard</p>
            </div>
            <PinEntryForm />
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-teal-100 py-4 px-4 md:px-6">
        <div className="container mx-auto text-center text-sm text-teal-600 mobile-safe-area">
          &copy; {new Date().getFullYear()} Zense Health. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
