export async function generatePDFReport(
  healthData: any,
  dateRange: { from: Date; to: Date },
  sectionVisibility: any
) {
  try {
    const response = await fetch(
      "https://api-4zhceyc45a-uc.a.run.app/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          healthData,
          dateRange,
          sectionVisibility,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers.get("content-disposition");
    let filename = "health-summary.pdf";
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
}
