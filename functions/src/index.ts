import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { onRequest } from "firebase-functions/v2/https";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import { format } from "date-fns";

import cors from "cors";

// Initialize Express app with CORS
// and body parser for JSON requests
// Set a reasonable limit for the request body size
// to prevent abuse and ensure performance
// Use a limit that balances performance and functionality
const app = express();
app.use(cors({ origin: true }));

app.use(bodyParser.json({ limit: "10mb" }));

app.post("/generate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { healthData, dateRange, sectionVisibility } = req.body;

    console.log("▶️ /generate called");
    console.log(
      "📦 healthData keys:",
      healthData ? Object.keys(healthData) : "undefined"
    );
    console.log("📅 dateRange:", dateRange);
    console.log("🔍 sectionVisibility:", sectionVisibility);

    // Fallback if healthData is missing or invalid
    if (!healthData || !Array.isArray(healthData.data)) {
      console.warn(
        "⚠️ Missing or invalid healthData. Returning placeholder PDF."
      );
      const fallbackHtml = "<h1>Invalid or empty report data</h1>";

      const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: (await chrome.executablePath) || undefined,
        headless: true,
      });

      const page = await browser.newPage();
      await page.setContent(fallbackHtml, { waitUntil: "networkidle0" });
      const fallbackPDF = await page.pdf({
        format: "a4",
        printBackground: true,
      });
      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=invalid-report.pdf"
      );
      res.send(Buffer.from(fallbackPDF));
      return;
    }

    console.log("✅ Starting HTML generation");

    // Apply fallback date parsing
    const fromDate = dateRange?.from ? new Date(dateRange.from) : new Date();
    const toDate = dateRange?.to ? new Date(dateRange.to) : new Date();

    // Basic HTML to verify rendering
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Test Report</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Health Summary Report</h1>
          <p>From: ${format(fromDate, "MMMM d, yyyy")}</p>
          <p>To: ${format(toDate, "MMMM d, yyyy")}</p>
          <p>Patient: ${healthData.patientName || "N/A"}</p>
        </body>
      </html>
    `;

    console.log("✅ HTML generation done");

    const executablePath = await chrome.executablePath;
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: executablePath || undefined,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "a4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=health-report.pdf"
    );
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error("🔥 PDF generation failed:", err);
    res.status(500).send("PDF generation failed");
  }
});

export const api = onRequest(
  {
    timeoutSeconds: 300,
    memory: "1GiB",
    region: "us-central1",
  },
  app
);
