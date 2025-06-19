"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateHTMLReport;
// generateHTMLReport.ts
const date_fns_1 = require("date-fns");
// Paste your entire original generateHTMLReport and generateVitalsAlerts here
function generateHTMLReport(healthData, dateRange, sectionVisibility) {
    const styles = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: white;
      }
      
      .container {
        max-width: 100%;
        padding: 0 20px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e2e8f0;
      }
      
      .header h1 {
        color: #0f172a;
        font-size: 28px;
        margin-bottom: 10px;
      }
      
      .header .subtitle {
        color: #64748b;
        font-size: 16px;
      }
      
      .section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }
      
      .section-title {
        color: #0f172a;
        font-size: 20px;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .patient-info {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }
      
      .info-item {
        margin-bottom: 10px;
      }
      
      .info-label {
        color: #64748b;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      
      .info-value {
        color: #0f172a;
        font-weight: 600;
        font-size: 14px;
      }
      
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 12px;
      }
      
      .data-table th {
        background: #f1f5f9;
        color: #374151;
        font-weight: 600;
        padding: 12px 8px;
        text-align: left;
        border-bottom: 2px solid #e2e8f0;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .data-table td {
        padding: 10px 8px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
      }
      
      .data-table tr:nth-child(even) {
        background: #f9fafb;
      }
      
      .data-table tr:hover {
        background: #f3f4f6;
      }
      
      .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .badge-success {
        background: #dcfce7;
        color: #166534;
      }
      
      .badge-warning {
        background: #fef3c7;
        color: #92400e;
      }
      
      .badge-error {
        background: #fee2e2;
        color: #991b1b;
      }
      
      .badge-info {
        background: #dbeafe;
        color: #1e40af;
      }
      
      .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .stat-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 15px;
        text-align: center;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
      
      .activities-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .activity-tag {
        background: #e0e7ff;
        color: #3730a3;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 500;
      }
      
      .mood-entry {
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 5px;
      }
      
      .mood-time {
        color: #64748b;
        font-size: 10px;
      }
      
      .vitals-alert {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 8px 12px;
        margin-bottom: 8px;
        border-radius: 0 4px 4px 0;
      }
      
      .vitals-alert.warning {
        background: #fffbeb;
        border-left-color: #f59e0b;
      }
      
      .alert-text {
        font-size: 11px;
        color: #374151;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .section {
          break-inside: avoid;
        }
        
        .data-table {
          break-inside: auto;
        }
        
        .data-table tr {
          break-inside: avoid;
          break-after: auto;
        }
      }
    </style>
  `;
    // Generate patient info section
    const patientInfoSection = sectionVisibility?.patientInfo
        ? `
    <div class="section no-break">
      <div class="patient-info">
        <h2 class="section-title">Patient Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Patient Name</div>
            <div class="info-value">${healthData.patientName || "Unknown"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Age</div>
            <div class="info-value">${healthData.patientAge || "Not specified"} ${healthData.patientAge ? "years" : ""}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Gender</div>
            <div class="info-value">${healthData.patientGender || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Location</div>
            <div class="info-value">${healthData.patientCity || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Mobile</div>
            <div class="info-value">${healthData.patientMobile || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Job Type</div>
            <div class="info-value">${healthData.jobType || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Service Type</div>
            <div class="info-value">${healthData.serviceType || "Not specified"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">
              <span class="badge ${healthData.status === "ongoing" ? "badge-success" : "badge-info"}">
                ${healthData.status || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
        : "";
    // Generate vitals summary
    const vitalsSection = sectionVisibility?.vitalsChart
        ? `
    <div class="section">
      <h2 class="section-title">Vitals History</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Blood Pressure</th>
            <th>Heart Rate</th>
            <th>Temperature</th>
            <th>Oxygen Level</th>
            <th>Blood Sugar</th>
          </tr>
        </thead>
        <tbody>
          ${healthData.data
            .map((day) => {
            if (!day.data?.vitalsHistory?.length) {
                return `
                <tr>
                  <td>${(0, date_fns_1.format)(new Date(day.date), "MMM d,PPPP")}</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              `;
            }
            return day.data.vitalsHistory
                .map((vital) => `
                <tr>
                  <td>${(0, date_fns_1.format)(new Date(day.date), "MMM d,PPPP")}</td>
                  <td>${vital.time || "—"}</td>
                  <td>${vital.bloodPressure || "—"}</td>
                  <td>${vital.heartRate ? `${vital.heartRate} bpm` : "—"}</td>
                  <td>${vital.temperature ? `${vital.temperature}°F` : "—"}</td>
                  <td>${vital.oxygenLevel ? `${vital.oxygenLevel}%` : "—"}</td>
                  <td>${vital.bloodSugar ? `${vital.bloodSugar} mg/dL` : "—"}</td>
                </tr>
              `)
                .join("");
        })
            .join("")}
        </tbody>
      </table>
    </div>
  `
        : "";
    // Generate vitals alerts section
    const vitalsAlertsSection = sectionVisibility?.vitalsAlerts
        ? `
    <div class="section">
      <h2 class="section-title">Vitals Alerts</h2>
      ${generateVitalsAlerts(healthData.data)}
    </div>
  `
        : "";
    // Generate diet summary
    const dietSection = sectionVisibility?.dietSummary
        ? `
    <div class="section">
      <h2 class="section-title">Diet Summary</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
            <th>Snacks</th>
            <th>Compliance</th>
          </tr>
        </thead>
        <tbody>
          ${healthData.data
            .map((day) => {
            if (!day.data?.diet) {
                return `
                <tr>
                  <td>${(0, date_fns_1.format)(new Date(day.date), "MMM d,PPPP")}</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              `;
            }
            const diet = day.data.diet;
            const total = Object.keys(diet).length;
            const completed = Object.values(diet).filter(Boolean).length;
            const percentage = Math.round((completed / total) * 100);
            return `
              <tr>
                <td>${(0, date_fns_1.format)(new Date(day.date), "MMM d,PPPP")}</td>
                <td>${diet.breakfast ? "✓" : "✗"}</td>
                <td>${diet.lunch ? "✓" : "✗"}</td>
                <td>${diet.dinner ? "✓" : "✗"}</td>
                <td>${diet.snacks ? "✓" : "✗"}</td>
                <td>
                  <span class="badge ${percentage >= 75
                ? "badge-success"
                : percentage >= 50
                    ? "badge-warning"
                    : "badge-error"}">
                    ${percentage}%
                  </span>
                </td>
              </tr>
            `;
        })
            .join("")}
        </tbody>
      </table>
    </div>
  `
        : "";
    // Generate mood summary
    const moodSection = sectionVisibility?.moodChart
        ? `
    <div class="section">
      <h2 class="section-title">Mood Summary</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Mood Entries</th>
          </tr>
        </thead>
        <tbody>
          ${healthData.data
            .map((day) => {
            const moods = day.data?.moodHistory || [];
            return `
              <tr>
                <td>${(0, date_fns_1.format)(new Date(day.date), "MMM d,PPPP")}</td>
                <td>
                  ${moods.length > 0
                ? moods
                    .map((mood) => `
                    <div class="mood-entry">
                      <strong>${mood.mood}</strong>
                      <span class="mood-time">(${mood.time})</span>
                    </div>
                  `)
                    .join("")
                : "—"}
                </td>
              </tr>
            `;
        })
            .join("")}
        </tbody>
      </table>
    </div>
  `
        : "";
    // Generate activities summary
    const activitiesSection = sectionVisibility?.detailedData
        ? `
    <div class="section">
      <h2 class="section-title">Activities Summary</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Activities</th>
          </tr>
        </thead>
        <tbody>
          ${healthData.data
            .map((day) => {
            const activities = day.data?.activities || [];
            return `
              <tr>
                <td>${(0, date_fns_1.format)(new Date(day.date), "MMM d,PPPP")}</td>
                <td>
                  ${activities.length > 0
                ? `
                    <div class="activities-list">
                      ${activities
                    .map((activity) => `
                        <span class="activity-tag">${activity}</span>
                      `)
                    .join("")}
                    </div>
                  `
                : "—"}
                </td>
              </tr>
            `;
        })
            .join("")}
        </tbody>
      </table>
    </div>
  `
        : "";
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Health Summary Report</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Health Summary Report</h1>
          <div class="subtitle">
            ${(0, date_fns_1.format)(new Date(dateRange.from), "d MMMM yyyy")} - ${(0, date_fns_1.format)(new Date(dateRange.to), "d MMMM yyyy")}
            </div>
        </div>
        
        ${patientInfoSection}
        ${vitalsSection}
        ${vitalsAlertsSection}
        ${dietSection}
        ${moodSection}
        ${activitiesSection}
      </div>
    </body>
    </html>
  `;
}
function generateVitalsAlerts(data) {
    const vitalRanges = {
        systolic: { min: 90, max: 140 },
        diastolic: { min: 60, max: 90 },
        temperature: { min: 97.0, max: 99.5 },
        oxygenLevel: { min: 95, max: 100 },
        bloodSugar: { min: 70, max: 140 },
        heartRate: { min: 60, max: 100 },
    };
    const alerts = [];
    data.forEach((day) => {
        if (!day.data?.vitalsHistory)
            return;
        day.data.vitalsHistory.forEach((entry) => {
            // Check blood pressure
            if (entry.bloodPressure) {
                const [systolic, diastolic] = entry.bloodPressure
                    .split("/")
                    .map(Number);
                if (systolic &&
                    (systolic > vitalRanges.systolic.max ||
                        systolic < vitalRanges.systolic.min)) {
                    alerts.push({
                        date: day.date,
                        time: entry.time,
                        type: "Blood Pressure (Systolic)",
                        value: `${systolic} mmHg`,
                        status: systolic > vitalRanges.systolic.max ? "High" : "Low",
                        severity: systolic > 160 || systolic < 80 ? "Critical" : "Warning",
                    });
                }
                if (diastolic &&
                    (diastolic > vitalRanges.diastolic.max ||
                        diastolic < vitalRanges.diastolic.min)) {
                    alerts.push({
                        date: day.date,
                        time: entry.time,
                        type: "Blood Pressure (Diastolic)",
                        value: `${diastolic} mmHg`,
                        status: diastolic > vitalRanges.diastolic.max ? "High" : "Low",
                        severity: diastolic > 100 || diastolic < 50 ? "Critical" : "Warning",
                    });
                }
            }
            // Check heart rate
            if (entry.heartRate) {
                const heartRate = Number.parseFloat(entry.heartRate);
                if (!isNaN(heartRate) &&
                    (heartRate > vitalRanges.heartRate.max ||
                        heartRate < vitalRanges.heartRate.min)) {
                    alerts.push({
                        date: day.date,
                        time: entry.time,
                        type: "Heart Rate",
                        value: `${heartRate} bpm`,
                        status: heartRate > vitalRanges.heartRate.max ? "High" : "Low",
                        severity: heartRate > 120 || heartRate < 40 ? "Critical" : "Warning", // Example critical values
                    });
                }
            }
            // Check temperature
            if (entry.temperature) {
                const temperature = Number.parseFloat(entry.temperature);
                if (!isNaN(temperature) &&
                    (temperature > vitalRanges.temperature.max ||
                        temperature < vitalRanges.temperature.min)) {
                    alerts.push({
                        date: day.date,
                        time: entry.time,
                        type: "Temperature",
                        value: `${temperature}°F`,
                        status: temperature > vitalRanges.temperature.max ? "High" : "Low",
                        severity: temperature > 101 || temperature < 96 ? "Critical" : "Warning",
                    });
                }
            }
            // Check oxygen level
            if (entry.oxygenLevel) {
                const oxygenLevel = Number.parseFloat(entry.oxygenLevel);
                if (!isNaN(oxygenLevel) &&
                    (oxygenLevel > vitalRanges.oxygenLevel.max ||
                        oxygenLevel < vitalRanges.oxygenLevel.min)) {
                    alerts.push({
                        date: day.date,
                        time: entry.time,
                        type: "Oxygen Level",
                        value: `${oxygenLevel}%`,
                        status: oxygenLevel > vitalRanges.oxygenLevel.max ? "High" : "Low",
                        severity: oxygenLevel < 90 ? "Critical" : "Warning", // Example critical value
                    });
                }
            }
            // Check blood sugar
            if (entry.bloodSugar) {
                const bloodSugar = Number.parseFloat(entry.bloodSugar);
                if (!isNaN(bloodSugar) &&
                    (bloodSugar > vitalRanges.bloodSugar.max ||
                        bloodSugar < vitalRanges.bloodSugar.min)) {
                    alerts.push({
                        date: day.date,
                        time: entry.time,
                        type: "Blood Sugar",
                        value: `${bloodSugar} mg/dL`,
                        status: bloodSugar > vitalRanges.bloodSugar.max ? "High" : "Low",
                        severity: bloodSugar > 200 || bloodSugar < 50 ? "Critical" : "Warning", // Example critical values
                    });
                }
            }
        });
    });
    if (alerts.length === 0) {
        return "<p>No vital sign alerts detected in the selected period.</p>";
    }
    return `
    <div>
      ${alerts
        .map((alert) => `
        <div class="vitals-alert ${alert.severity === "Critical" ? "" : "warning"}">
          <div class="alert-text">
            <strong>${alert.type} - ${alert.status}</strong><br>
            ${(0, date_fns_1.format)(new Date(alert.date), "MMM d,PPPP")} at ${alert.time} - Value: ${alert.value}
            <span class="badge ${alert.severity === "Critical" ? "badge-error" : "badge-warning"}">${alert.severity}</span>
          </div>
        </div>
      `)
        .join("")}
    </div>
  `;
}
