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
const cors_1 = __importDefault(require("cors"));
const date_fns_1 = require("date-fns");
const generateHTMLReport_1 = __importDefault(require("./generateHTMLReport")); // <- move the large helper here
const generateStaffHTMLReport_1 = __importDefault(require("./generateStaffHTMLReport"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.post("/generate", async (req, res) => {
    try {
        const { healthData, dateRange, sectionVisibility } = req.body;
        console.log("📩 Received /generate POST");
        console.log("🧾 healthData keys:", healthData ? Object.keys(healthData) : "N/A");
        const htmlContent = (0, generateHTMLReport_1.default)(healthData, dateRange, sectionVisibility);
        console.log("✅ HTML generated. Length:", htmlContent.length);
        const executablePath = await chrome_aws_lambda_1.default.executablePath;
        const browser = await puppeteer_core_1.default.launch({
            args: [...chrome_aws_lambda_1.default.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chrome_aws_lambda_1.default.defaultViewport,
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
          <span>Health Summary Report - ${healthData.patientName || "Patient"}</span>
        </div>`,
            footerTemplate: `
        <div style="font-size:10px;width:100%;text-align:center;color:#666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated on ${(0, date_fns_1.format)(new Date(), "MMMM d, yyyy 'at' h:mm a")}
        </div>`,
        });
        await browser.close();
        const filename = `health-summary-${(healthData.patientName || "patient")
            .replace(/\s+/g, "-")
            .toLowerCase()}-${(0, date_fns_1.format)(new Date(dateRange.from), "yyyy-MM-dd")}-to-${(0, date_fns_1.format)(new Date(dateRange.to), "yyyy-MM-dd")}.pdf`;
        console.log("📄 PDF generated and named:", filename);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", pdfBuffer.length.toString());
        res.send(Buffer.from(pdfBuffer));
    }
    catch (err) {
        console.error("🔥 Error generating PDF:", err.message || err);
        if (err.stack)
            console.error("🧯 Stack:", err.stack);
        res.status(500).send("Failed to generate PDF.");
    }
});
app.post("/generateStaffPDF", async (req, res) => {
    try {
        const { staff, groupedDuties, reviews } = req.body;
        if (!staff || !groupedDuties) {
            res.status(400).json({ error: "Missing staff or duties data" });
            return;
        }
        console.log("📩 Received /generateStaffPDF POST");
        console.log("🧾 staff keys:", staff ? Object.keys(staff) : "N/A");
        const htmlContent = (0, generateStaffHTMLReport_1.default)(staff, groupedDuties, reviews);
        console.log("✅ Staff HTML generated. Length:", htmlContent.length);
        const executablePath = await chrome_aws_lambda_1.default.executablePath;
        const browser = await puppeteer_core_1.default.launch({
            args: [...chrome_aws_lambda_1.default.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chrome_aws_lambda_1.default.defaultViewport,
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
    }
    catch (err) {
        console.error("🔥 Error generating staff PDF:", err.message || err);
        if (err.stack)
            console.error("🧯 Stack:", err.stack);
        res.status(500).send("Failed to generate staff PDF.");
    }
});
exports.api = (0, https_1.onRequest)({
    timeoutSeconds: 300,
    memory: "1GiB",
    region: "us-central1",
}, app);
