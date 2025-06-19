"use client";

import { useState, useEffect } from "react";
import { format, subDays, parseISO } from "date-fns";
import {
  CalendarIcon,
  Download,
  Loader2,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { fetchHealthData, getMockHealthData } from "@/lib/api";
import { VitalsChart } from "@/components/vitals-chart";
import { MoodChart } from "@/components/mood-chart";
import { DietSummary } from "@/components/diet-summary";
import { ActivitiesList } from "@/components/activities-list";
import { VitalsList } from "@/components/vitals-list";
import { generatePDFReport } from "@/lib/pdf-service";
import { PatientInfo } from "@/components/patient-info";
import { VitalsAlerts } from "@/components/vitals-alerts";
import {
  SectionVisibility,
  type SectionVisibility as SectionVisibilityType,
} from "@/components/section-visibility";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";

export function Dashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const [sectionVisibility, setSectionVisibility] =
    useState<SectionVisibilityType>({
      patientInfo: true,
      vitalsChart: true,
      moodChart: true,
      vitalsAlerts: true,
      dietSummary: false,
      detailedData: false,
    });

  // Initialize date range from job data
  useEffect(() => {
    const jobDataStr = sessionStorage.getItem("jobData");
    if (jobDataStr) {
      try {
        const jobData = JSON.parse(jobDataStr);
        if (jobData.startDate && jobData.endDate) {
          let startDate, endDate;

          // Handle ISO string format
          if (typeof jobData.startDate === "string") {
            try {
              startDate = parseISO(jobData.startDate);
            } catch {
              // Fallback for other string formats
              startDate = new Date(jobData.startDate);
            }
          } else {
            startDate = new Date(jobData.startDate);
          }

          if (typeof jobData.endDate === "string") {
            try {
              endDate = parseISO(jobData.endDate);
            } catch {
              endDate = new Date(jobData.endDate);
            }
          } else {
            endDate = new Date(jobData.endDate);
          }

          // Validate dates
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            setDateRange({
              from: startDate,
              to: endDate,
            });
          } else {
            throw new Error("Invalid dates");
          }
        } else {
          throw new Error("No dates in job data");
        }
      } catch (error) {
        console.error("Error parsing job data dates:", error);
        // Fallback to last 7 days
        setDateRange({
          from: subDays(new Date(), 7),
          to: new Date(),
        });
      }
    } else {
      setDateRange({
        from: subDays(new Date(), 7),
        to: new Date(),
      });
    }
  }, []);

  // Fetch health data when userId or date range changes
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !dateRange?.from || !dateRange?.to) return;

      setIsLoading(true);
      setError(null);

      try {
        const formattedStartDate = format(dateRange.from, "yyyy-MM-dd");
        const formattedEndDate = format(dateRange.to, "yyyy-MM-dd");

        console.log("Attempting to fetch data for userId:", userId);

        const data = await fetchHealthData(
          userId,
          formattedStartDate,
          formattedEndDate
        );
        setHealthData(data);
        setIsUsingMockData(false);
        console.log("hd : ", healthData);
      } catch (error) {
        console.error("Error fetching health data:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );

        // Try to use mock data as fallback
        try {
          const formattedStartDate = format(dateRange.from, "yyyy-MM-dd");
          const formattedEndDate = format(dateRange.to, "yyyy-MM-dd");

          const mockData = await getMockHealthData(
            userId,
            formattedStartDate,
            formattedEndDate
          );
          setHealthData(mockData);
          setIsUsingMockData(true);
          console.log("hd2 : ", healthData);

          toast({
            title: "🎭 Using Demo Data",
            description:
              "Unable to fetch live data. Showing demo data for testing.",
            variant: "default",
          });
        } catch (mockError) {
          console.error("Error loading mock data:", mockError);
          toast({
            title: "❌ Error",
            description: "Failed to load health data. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, dateRange, toast]);

  const handleRetry = () => {
    if (dateRange?.from && dateRange?.to) {
      // Trigger a re-fetch by updating the effect dependency
      setIsLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          const formattedStartDate = format(dateRange.from!, "yyyy-MM-dd");
          const formattedEndDate = format(dateRange.to!, "yyyy-MM-dd");

          const data = await fetchHealthData(
            userId,
            formattedStartDate,
            formattedEndDate
          );
          setHealthData(data);
          setIsUsingMockData(false);
          setError(null);

          toast({
            title: "✅ Success",
            description: "Health data loaded successfully.",
          });
        } catch (error) {
          console.error("Retry failed:", error);
          setError(error instanceof Error ? error.message : "Retry failed");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  };

  const handleDownloadPDF = async () => {
    if (!healthData || !dateRange) return;

    setIsGeneratingPDF(true);
    try {
      await generatePDFReport(healthData, dateRange, sectionVisibility);
      toast({
        title: "✅ Success",
        description: "Health summary downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "❌ Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("pin");
    sessionStorage.removeItem("jobData");

    // Redirect to home page
    router.push("/");
  };

  const MobileActions = () => (
    <div className="flex flex-col gap-3 p-4">
      <Button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF || isLoading || !healthData}
        // disabled
        className="w-full bg-teal-700 hover:bg-teal-800 text-white"
      >
        {isGeneratingPDF ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            📄 Download Summary
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
      >
        <LogOut className="h-4 w-4 mr-2" />
        🚪 Logout
      </Button>
    </div>
  );

  return (
    <div className="my-2 mx-4 min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-20">
        <div className="container mx-auto py-3 md:py-4 px-4 md:px-6 mobile-safe-area">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0 m-2 mx-6 ">
              <h1 className="text-3xl md:text-4xl font-bold text-teal-900 truncate">
                Health Dashboard
              </h1>
              <p className="pt-1 text-lg md:text-xl text-teal-600 truncate">
                {healthData?.patientName ? (
                  <>
                    {healthData.patientName}'s Data
                    {isUsingMockData && " (Demo)"}
                  </>
                ) : (
                  "Loading patient data..."
                )}
              </p>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || isLoading || !healthData}
                // disabled
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    📄 Download
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                🚪 Logout
              </Button>
            </div>

            {/* Mobile Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="md:hidden text-teal-700 hover:bg-teal-50 px-4 py-2 mr-3 flex items-center gap-2 border-teal-200"
            >
              <LogOut className="h-5 w-5 font-bold" />
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Download Button for Mobile */}
      <Button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF || isLoading || !healthData}
        // disabled
        className="fixed bottom-6 right-6 md:hidden w-16 h-16 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-lg z-50"
      >
        {isGeneratingPDF ? (
          <Loader2 className="h-20 w-20 text-6xl animate-spin" />
        ) : (
          <Download className="h-20 w-20 text-6xl" />
        )}
      </Button>

      <main className="container mx-auto py-4 md:py-6 px-4 md:px-6 mobile-safe-area">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
                </div>
              </div>
              <div>
                <p className="text-teal-900 font-medium">
                  Loading health data...
                </p>
                <p className="text-teal-600 text-sm">
                  Please wait while we fetch the information
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Section Visibility Controls */}
            <SectionVisibility
              visibility={sectionVisibility}
              onChange={setSectionVisibility}
            />

            {/* Error Alert */}
            {error && !isUsingMockData && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-red-900">
                  ⚠️ Error Loading Data
                </AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-red-800">{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="border-red-300 text-red-700 hover:bg-red-100 w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    🔄 Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Demo Data Alert */}
            {isUsingMockData && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">
                  Demo Data Mode
                </AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-amber-800">
                    Unable to connect to live data. Showing demo data for
                    testing purposes.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    🔄 Try Live Data
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {healthData && sectionVisibility.patientInfo && (
              <PatientInfo patientData={healthData} />
            )}

            {/* Date Range Filter */}
            <Card className="border-teal-100 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-teal-900 flex items-center gap-2">
                  📅<span className="px-0.5"></span>Filter Date
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Select start and end dates to view health data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-row gap-4">
                  {/* Start Date Picker */}
                  <div className="flex-1 space-y-2">
                    <Label className="text-teal-700">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-teal-200 hover:bg-teal-50",
                            !dateRange?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                          {dateRange?.from ? (
                            format(dateRange.from, "LLL dd, y")
                          ) : (
                            <span>Select start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-teal-100"
                        align="start"
                      >
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={dateRange?.from}
                          onSelect={(date) => {
                            if (date) {
                              setDateRange((prev) => ({
                                from: date,
                                to: prev?.to || date,
                              }));
                            }
                          }}
                          className="rounded-md border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date Picker */}
                  <div className="flex-1 space-y-2">
                    <Label className="text-teal-700">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-teal-200 hover:bg-teal-50",
                            !dateRange?.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                          {dateRange?.to ? (
                            format(dateRange.to, "LLL dd, y")
                          ) : (
                            <span>Select end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-teal-100"
                        align="start"
                      >
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={dateRange?.to}
                          onSelect={(date) => {
                            if (date) {
                              setDateRange((prev) => ({
                                from: prev?.from || date,
                                to: date,
                              }));
                            }
                          }}
                          className="rounded-md border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {healthData && sectionVisibility.vitalsChart && (
                <VitalsChart data={healthData.data} />
              )}
              {healthData && sectionVisibility.moodChart && (
                <MoodChart data={healthData.data} />
              )}
            </div>

            {/* Vitals Alerts */}
            {healthData && sectionVisibility.vitalsAlerts && (
              <VitalsAlerts data={healthData.data} />
            )}

            {/* Diet Summary */}
            {healthData && sectionVisibility.dietSummary && (
              <DietSummary data={healthData.data} />
            )}

            {/* Detailed Data Tabs */}
            {healthData && sectionVisibility.detailedData && (
              <Card className="border-teal-100 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-teal-900 flex items-center gap-2">
                    📊<span className="px-0.5"></span>Detailed Health Data
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    View detailed health information by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="vitals" className="w-full">
                    <div className="px-6 pt-2">
                      <TabsList className="grid grid-cols-3 w-full bg-teal-50 border border-teal-100">
                        <TabsTrigger
                          value="vitals"
                          className="data-[state=active]:bg-teal-700 data-[state=active]:text-white"
                        >
                          💓 Vitals
                        </TabsTrigger>
                        <TabsTrigger
                          value="activities"
                          className="data-[state=active]:bg-teal-700 data-[state=active]:text-white"
                        >
                          🏃 Activities
                        </TabsTrigger>
                        <TabsTrigger
                          value="mood"
                          className="data-[state=active]:bg-teal-700 data-[state=active]:text-white"
                        >
                          😊 Mood
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <div className="p-6 pt-4">
                      <TabsContent value="vitals" className="mt-0">
                        {healthData && <VitalsList data={healthData.data} />}
                      </TabsContent>
                      <TabsContent value="activities" className="mt-0">
                        {healthData && (
                          <ActivitiesList data={healthData.data} />
                        )}
                      </TabsContent>
                      <TabsContent value="mood" className="mt-0">
                        {healthData && (
                          <div className="space-y-4">
                            {healthData.data.map((day: any) => {
                              if (
                                !day.data ||
                                !day.data.moodHistory ||
                                day.data.moodHistory.length === 0
                              ) {
                                return null;
                              }

                              return (
                                <Card
                                  key={day.date}
                                  className="border-teal-100"
                                >
                                  <CardHeader className="py-3">
                                    <CardTitle className="text-sm font-medium text-teal-900">
                                      📅{" "}
                                      {format(
                                        new Date(day.date),
                                        "EEEE, MMMM d, yyyy"
                                      )}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="py-2">
                                    <div className="space-y-2">
                                      {day.data.moodHistory.map(
                                        (mood: any, index: number) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between text-sm bg-teal-50 p-2 rounded-lg"
                                          >
                                            <span className="font-medium text-teal-900">
                                              😊 {mood.mood}
                                            </span>
                                            <span className="text-teal-600">
                                              🕐 {mood.time}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
