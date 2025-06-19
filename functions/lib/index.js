"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const https_1 = require("firebase-functions/v2/https");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const date_fns_1 = require("date-fns");
const cors_1 = __importDefault(require("cors"));
// Initialize Express app with CORS
// and body parser for JSON requests
// Set a reasonable limit for the request body size
// to prevent abuse and ensure performance
// Use a limit that balances performance and functionality
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.post("/generate", async (req, res) => {
    try {
        const { healthData, dateRange, sectionVisibility } = req.body;
        console.log("▶️ /generate called");
        console.log("📦 healthData keys:", healthData ? Object.keys(healthData) : "undefined");
        console.log("📅 dateRange:", dateRange);
        console.log("🔍 sectionVisibility:", sectionVisibility);
        // Fallback if healthData is missing or invalid
        if (!healthData || !Array.isArray(healthData.data)) {
            console.warn("⚠️ Missing or invalid healthData. Returning placeholder PDF.");
            const fallbackHtml = "<h1>Invalid or empty report data</h1>";
            const browser = await puppeteer_core_1.default.launch({
                args: chrome_aws_lambda_1.default.args,
                executablePath: (await chrome_aws_lambda_1.default.executablePath) || undefined,
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
            res.setHeader("Content-Disposition", "attachment; filename=invalid-report.pdf");
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
          <p>From: ${(0, date_fns_1.format)(fromDate, "MMMM d, yyyy")}</p>
          <p>To: ${(0, date_fns_1.format)(toDate, "MMMM d, yyyy")}</p>
          <p>Patient: ${healthData.patientName || "N/A"}</p>
        </body>
      </html>
    `;
        console.log("✅ HTML generation done");
        const executablePath = await chrome_aws_lambda_1.default.executablePath;
        const browser = await puppeteer_core_1.default.launch({
            args: chrome_aws_lambda_1.default.args,
            executablePath: executablePath || undefined,
            headless: true,
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdf = await page.pdf({ format: "a4", printBackground: true });
        await browser.close();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=health-report.pdf");
        res.send(Buffer.from(pdf));
    }
    catch (err) {
        console.error("🔥 PDF generation failed:", err);
        res.status(500).send("PDF generation failed");
    }
});
exports.api = (0, https_1.onRequest)({
    timeoutSeconds: 300,
    memory: "1GiB",
    region: "us-central1",
}, app);
