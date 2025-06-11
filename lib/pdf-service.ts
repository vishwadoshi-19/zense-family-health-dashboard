export async function generatePDFReport(healthData: any, dateRange: { from: Date; to: Date }, sectionVisibility: any) {
  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        healthData,
        dateRange,
        sectionVisibility,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get the PDF blob
    const blob = await response.blob()

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url

    // Extract filename from response headers or create default
    const contentDisposition = response.headers.get("content-disposition")
    let filename = "health-summary.pdf"

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
