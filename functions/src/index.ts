import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { onRequest } from "firebase-functions/v2/https";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import cors from "cors";
import { format } from "date-fns";

import generateHTMLReport from "./generateHTMLReport"; // <- move the large helper here
import generateStaffHTMLReport from "./generateStaffHTMLReport";

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/generate", async (req: Request, res: Response) => {
  try {
    const { healthData, dateRange, sectionVisibility } = req.body;

    console.log("📩 Received /generate POST");
    console.log(
      "🧾 healthData keys:",
      healthData ? Object.keys(healthData) : "N/A"
    );

    const htmlContent = generateHTMLReport(
      healthData,
      dateRange,
      sectionVisibility
    );
    console.log("✅ HTML generated. Length:", htmlContent.length);

    const executablePath = await chrome.executablePath;
    const browser = await puppeteer.launch({
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: executablePath || undefined,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:10px;width:100%;text-align:center;color:#666;">
          <span>Health Summary Report - ${
            healthData.patientName || "Patient"
          }</span>
        </div>`,
      footerTemplate: `
        <div style="font-size:10px;width:100%;text-align:center;color:#666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated on ${format(
            new Date(),
            "MMMM d, yyyy 'at' h:mm a"
          )}
        </div>`,
    });

    await browser.close();

    const filename = `health-summary-${(healthData.patientName || "patient")
      .replace(/\s+/g, "-")
      .toLowerCase()}-${format(
      new Date(dateRange.from),
      "yyyy-MM-dd"
    )}-to-${format(new Date(dateRange.to), "yyyy-MM-dd")}.pdf`;

    console.log("📄 PDF generated and named:", filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    res.send(Buffer.from(pdfBuffer));
  } catch (err: any) {
    console.error("🔥 Error generating PDF:", err.message || err);
    if (err.stack) console.error("🧯 Stack:", err.stack);
    res.status(500).send("Failed to generate PDF.");
  }
});

app.post("/generateStaffPDF", async (req: Request, res: Response) => {
  try {
    const { staff, groupedDuties, reviews } = req.body;
    if (!staff || !groupedDuties) {
      res.status(400).json({ error: "Missing staff or duties data" });
      return;
    }

    console.log("📩 Received /generateStaffPDF POST");
    console.log("🧾 staff keys:", staff ? Object.keys(staff) : "N/A");

    const htmlContent = generateStaffHTMLReport(staff, groupedDuties, reviews);
    console.log("✅ Staff HTML generated. Length:", htmlContent.length);

    const executablePath = await chrome.executablePath;
    const browser = await puppeteer.launch({
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: executablePath || undefined,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      displayHeaderFooter: false,
      pageRanges: '1', // Only the first page will be included
      scale: 1, // Default scale
    });

    await browser.close();

    const filename = `${staff.name || staff.fullName || "Staff"} Resume.pdf`;

    console.log("📄 Staff PDF generated and named:", filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    res.send(Buffer.from(pdfBuffer));
  } catch (err: any) {
    console.error("🔥 Error generating staff PDF:", err.message || err);
    if (err.stack) console.error("🧯 Stack:", err.stack);
    res.status(500).send("Failed to generate staff PDF.");
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
