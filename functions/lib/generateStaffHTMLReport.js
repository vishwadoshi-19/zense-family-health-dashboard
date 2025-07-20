"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateStaffHTMLReport;
function generateStaffHTMLReport(staff, groupedDuties, reviews) {
    const styles = `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #fff;
        color: #222;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 16px 10px;
        background: #f8fafc;
        border-radius: 12px;
        box-shadow: 0 2px 12px #0001;
        height: 100vh;
        max-height: 100vh;
        overflow: auto;
      }
      .header {
        text-align: center;
        margin-bottom: 12px;
      }
      .header h1 {
        display: none;
      }
      .header .subtitle {
        color: #64748b;
        font-size: 1.1rem;
      }
      .columns {
        display: flex;
        gap: 32px;
        margin-bottom: 32px;
      }
      .col {
        flex: 1 1 0;
        background: #fff;
        border-radius: 8px;
        padding: 24px 18px;
        box-shadow: 0 1px 6px #0001;
      }
      .profile-pic {
        display: block;
        margin: 0 auto 18px auto;
        width: 110px;
        height: 110px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #14b8a6;
        background: #e0f2f1;
      }
      .section-title {
        color: #14b8a6;
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 12px;
        border-bottom: 1px solid #e0f2f1;
        padding-bottom: 4px;
      }
      .info-list {
        list-style: none;
        padding: 0;
        margin: 0 0 18px 0;
      }
      .info-list li {
        margin-bottom: 8px;
        font-size: 1rem;
      }
      .label {
        color: #64748b;
        font-size: 0.95rem;
        font-weight: 600;
        margin-right: 6px;
      }
      .chip {
        display: inline-block;
        background: #e0f2f1;
        color: #14b8a6;
        border-radius: 12px;
        padding: 3px 10px;
        font-size: 0.95rem;
        margin: 2px 4px 2px 0;
        font-weight: 500;
      }
      .chip.mandatory {
        background: #14b8a6;
        color: #fff;
      }
      .category {
        margin-top: 10px;
        margin-bottom: 4px;
        font-weight: 600;
        color: #0f172a;
      }
      /* .reviews-section {
        margin-top: 32px;
        background: #fff;
        border-radius: 8px;
        padding: 18px;
        box-shadow: 0 1px 6px #0001;
      }
      .review {
        margin-bottom: 14px;
        font-size: 1rem;
        color: #374151;
      }
      .reviewer {
        color: #14b8a6;
        font-size: 0.95rem;
        font-weight: 600;
      } */
    </style>
  `;
    // Profile photo selection logic
    let profilePic = "";
    if (staff.profilePhoto) {
        profilePic = staff.profilePhoto;
    }
    else if (staff.jobRole === "nurse") {
        profilePic = staff.gender === "male"
            ? "https://zense.in/uploads/nurse_male.png"
            : "https://zense.in/uploads/nurse_female.png";
    }
    else {
        profilePic = staff.gender === "male"
            ? "https://zense.in/uploads/attendant_male.png"
            : "https://zense.in/uploads/attendant_female.png";
    }
    // Helper functions for formatting shift values
    const formatShiftType = (shiftType) => {
        if (!shiftType)
            return "N/A";
        if (shiftType.toLowerCase() === "both")
            return "12h/24h";
        return shiftType.toUpperCase();
    };
    const formatShiftTime = (shiftTime) => {
        if (!shiftTime)
            return "N/A";
        if (shiftTime.toLowerCase() === "both")
            return "Day/Night";
        return shiftTime.toUpperCase();
    };
    // Left column: Personal & Preferences
    let leftCol = `
    <img class="profile-pic" src="${profilePic}" alt="Profile Photo" />
    <h2 style="text-align:center; color:#14b8a6; margin-bottom:6px;">${staff.name || staff.fullName || "Staff"}</h2>
    <div style="text-align:center; color:#64748b; margin-bottom:18px;">${staff.jobRole ? staff.jobRole.charAt(0).toUpperCase() + staff.jobRole.slice(1) : "Staff"}</div>
    <div class="section-title">Details</div>
    <ul class="info-list">
      <li><span class="label">Experience:</span> ${staff.experienceYears || "<1"} yrs</li>
      <li><span class="label">Education:</span> ${staff.educationQualification || "N/A"}</li>
    </ul>
    <div class="section-title">Preferences</div>
    <ul class="info-list">
      <li><span class="label">Eats:</span> ${staff.foodPreference || "N/A"}</li>
      <li><span class="label">Smoking:</span> ${staff.smokes || "N/A"}</li>
      <li><span class="label">Shift Type:</span> ${formatShiftType(staff.shiftType)}</li>
      <li><span class="label">Shift Time:</span> ${formatShiftTime(staff.shiftTime)}</li>
    </ul>
    <div class="section-title">Verification</div>
    <ul class="info-list">
      <li><span class="label">Aadhar:</span> ${staff.identityDocuments?.aadharNumber || "N/A"}</li>
    </ul>
  `;
    // Add non-essential services to left column
    console.log("Available categories:", Object.keys(groupedDuties));
    const nonEssentialServices = groupedDuties["non-essential services"] || groupedDuties["Non-essential services"] || groupedDuties["non essential services"];
    console.log("Non-essential services found:", !!nonEssentialServices);
    if (nonEssentialServices) {
        console.log("Staff services:", staff.services);
        // Check for both lowercase and uppercase variations in staff services
        const staffNonEssentialServices = staff.services?.["non-essential services"] || staff.services?.["Non-essential services"] || staff.services?.["Non-Essential Services"] || [];
        const selectedMandatory = nonEssentialServices.mandatory.filter((duty) => staffNonEssentialServices.includes(duty.label));
        const selectedOptional = nonEssentialServices.optional.filter((duty) => staffNonEssentialServices.includes(duty.label));
        console.log("Selected mandatory:", selectedMandatory.length, "Selected optional:", selectedOptional.length);
        if (selectedMandatory.length > 0 || selectedOptional.length > 0) {
            leftCol += `<div class="section-title">Non-Essential Services</div>`;
            [...selectedMandatory, ...selectedOptional].forEach((duty) => {
                leftCol += `<span class="chip${duty.mandatoryFor.includes(staff.jobRole) ? ' mandatory' : ''}">${duty.label}</span>`;
            });
        }
    }
    // Right column: Services (excluding non-essential services)
    let rightCol = `<div class="section-title">Services I Offer</div>`;
    Object.entries(groupedDuties).forEach(([category, group]) => {
        // Skip non-essential services as they're now in the left column
        if (category === "non-essential services" || category === "Non-essential services" || category === "non essential services")
            return;
        const selectedMandatory = group.mandatory.filter((duty) => staff.services?.[category]?.includes(duty.label));
        const selectedOptional = group.optional.filter((duty) => staff.services?.[category]?.includes(duty.label));
        if (selectedMandatory.length === 0 && selectedOptional.length === 0)
            return;
        rightCol += `<div class="category">${category}</div>`;
        [...selectedMandatory, ...selectedOptional].forEach((duty) => {
            rightCol += `<span class="chip${duty.mandatoryFor.includes(staff.jobRole) ? ' mandatory' : ''}">${duty.label}</span>`;
        });
    });
    // Reviews section (commented out)
    /*
    let reviewsSection = `<div class="reviews-section">
      <div class="section-title">What others say</div>`;
    if (reviews && reviews.length > 0) {
      reviews.slice(0, 2).forEach((review: any) => {
        reviewsSection += `<div class="review">"${review.text}"<br/><span class="reviewer">- ${review.customerName || review.name}</span></div>`;
      });
    } else {
      reviewsSection += `<div class="review">No reviews available.</div>`;
    }
    reviewsSection += `</div>`;
    */
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Staff Resume</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- Heading removed -->
        </div>
        <div class="columns">
          <div class="col">${leftCol}</div>
          <div class="col">${rightCol}</div>
        </div>
        <!-- ${"reviewsSection"} -->
      </div>
    </body>
    </html>
  `;
}
