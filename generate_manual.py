import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress headers and footers on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#065F46")) # Dark Emerald Header Text

        # Header Text
        self.drawString(54, 11 * 72 - 36, "TARABA STATE EMPLOYEE VERIFICATION PORTAL")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4B5563"))
        self.drawRightString(8.5 * 72 - 54, 11 * 72 - 36, "User & Admin Operational Manual")

        # Header Line
        self.setStrokeColor(colors.HexColor("#059669"))
        self.setLineWidth(0.75)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Footer Line
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.5)
        self.line(54, 46, 8.5 * 72 - 54, 46)

        # Footer Text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B7280"))
        self.drawString(54, 32, "Confidential - Taraba State Government © 2026")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 32, page_text)
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#065F46") # Emerald 800
    secondary_color = colors.HexColor("#047857") # Emerald 700
    accent_color = colors.HexColor("#0284C7") # Sky 600
    dark_neutral = colors.HexColor("#1F2937") # Gray 800
    body_color = colors.HexColor("#374151") # Gray 700

    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=32,
        textColor=primary_color,
        alignment=TA_CENTER,
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=dark_neutral,
        alignment=TA_CENTER,
        spaceAfter=30
    )

    h1_style = ParagraphStyle(
        "CustomH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        "CustomH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=secondary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        "CustomH3",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=dark_neutral,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=body_color,
        spaceAfter=8,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        "CustomBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=body_color,
        leftIndent=15,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        "CalloutText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E3A8A") # Dark Blue
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=dark_neutral
    )

    story = []

    # ================= COVER PAGE =================
    story.append(Spacer(1, 40))
    story.append(Paragraph("TARABA STATE GOVERNMENT", ParagraphStyle("GovHeader", fontName="Helvetica-Bold", fontSize=14, leading=16, textColor=secondary_color, alignment=TA_CENTER, spaceAfter=8)))
    story.append(Paragraph("OFFICE OF THE HEAD OF SERVICE / MINISTRY OF FINANCE", ParagraphStyle("DeptHeader", fontName="Helvetica", fontSize=10, leading=12, textColor=colors.HexColor("#6B7280"), alignment=TA_CENTER, spaceAfter=25)))
    
    # Decorative line
    story.append(HRFlowable(width="60%", thickness=3, color=primary_color, spaceBefore=0, spaceAfter=30))
    
    story.append(Paragraph("Taraba State Employee Verification Portal", title_style))
    story.append(Paragraph("Comprehensive End-to-End User Manual & Administrative Guide", subtitle_style))
    
    story.append(Spacer(1, 30))

    # Metadata Box on Cover Page
    meta_data = [
        [Paragraph("<b>Document Version:</b>", table_cell_style), Paragraph("v2.4 (Enterprise Edition)", table_cell_style)],
        [Paragraph("<b>Target Audience:</b>", table_cell_style), Paragraph("Civil Servants, Departmental Admins, System Auditors", table_cell_style)],
        [Paragraph("<b>Supported Modules:</b>", table_cell_style), Paragraph("Employee Self-Verification, Admin Dashboard, RBAC, File Manager", table_cell_style)],
        [Paragraph("<b>Security Classification:</b>", table_cell_style), Paragraph("Official / Confidential", table_cell_style)],
        [Paragraph("<b>Last Updated:</b>", table_cell_style), Paragraph("August 2026", table_cell_style)],
    ]
    t_meta = Table(meta_data, colWidths=[150, 310])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F3F4F6")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor("#E5E7EB")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D1D5DB")),
    ]))
    story.append(t_meta)

    story.append(Spacer(1, 60))
    story.append(Paragraph("<b>Notice:</b> This manual provides operational guidance for public employee verification and administrative portal management under Taraba State Civil Service digitized verification standard.", ParagraphStyle("CoverNotice", fontName="Helvetica-Oblique", fontSize=8.5, leading=12, textColor=colors.HexColor("#4B5563"), alignment=TA_CENTER)))

    story.append(PageBreak())

    # ================= TABLE OF CONTENTS / OVERVIEW =================
    story.append(Paragraph("Table of Contents", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=12))

    toc_items = [
        ("1. Executive Summary & System Overview", "Page 3"),
        ("2. Architecture & Access Roles", "Page 3"),
        ("3. Module 1: Employee Self-Verification Guide", "Page 4"),
        ("    3.1 Step 1: NIN Verification & Biometric Identity Lookup", "Page 4"),
        ("    3.2 Step 2: Personal Information Entry", "Page 4"),
        ("    3.3 Step 3: Employment Details & Service History", "Page 5"),
        ("    3.4 Step 4: Credential & Document Upload", "Page 5"),
        ("    3.5 Step 5: Final Review & Registration Slip Generation", "Page 5"),
        ("4. Module 2: Tracking Application Status", "Page 6"),
        ("    4.1 Lookup via Registration Number / Staff ID", "Page 6"),
        ("    4.2 Online Re-Verification & Post-Submission Update", "Page 6"),
        ("5. Module 3: Admin Panel Comprehensive Operational Guide", "Page 7"),
        ("    5.1 Secure Administrator Login & Access Control", "Page 7"),
        ("    5.2 Executive Dashboard & Real-Time Analytics", "Page 7"),
        ("    5.3 Employee Management Directory & Bulk Operations", "Page 8"),
        ("    5.4 CSV / Excel Bulk Employee Data Import Tool", "Page 8"),
        ("    5.5 Document Verification & Credential Audit Workflow", "Page 9"),
        ("    5.6 Enterprise File Manager & Folder Operations", "Page 9"),
        ("    5.7 Role-Based Access Control (RBAC) & Custom Roles", "Page 10"),
        ("    5.8 Granular Permissions Management Engine", "Page 10"),
        ("    5.9 Global System Settings & Custom Branding", "Page 11"),
        ("    5.10 Administrator Profile & Security Settings", "Page 11"),
        ("6. Security, Compliance & System Troubleshooting", "Page 12"),
    ]

    for title, pg in toc_items:
        is_sub = title.startswith("    ")
        style = ParagraphStyle(
            "TOCItem",
            fontName="Helvetica-Bold" if not is_sub else "Helvetica",
            fontSize=9.5 if not is_sub else 8.5,
            leading=14,
            textColor=primary_color if not is_sub else body_color
        )
        dots = ". " * int((460 - len(title)*5) / 10)
        t_row = Table([[Paragraph(title.strip(), style), Paragraph(pg, ParagraphStyle("TOCPg", fontName="Helvetica-Bold", fontSize=9, alignment=TA_RIGHT, textColor=primary_color))]], colWidths=[380, 80])
        t_row.setStyle(TableStyle([
            ('PADDING', (0,0), (-1,-1), 3),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t_row)

    story.append(Spacer(1, 15))

    # SECTION 1
    story.append(Paragraph("1. Executive Summary & System Overview", h1_style))
    story.append(Paragraph("The <b>Taraba State Employee Verification Portal</b> is a state-of-the-art digital infrastructure platform designed to validate, record, and maintain authentic civil service records across all Ministries, Departments, and Agencies (MDAs) in Taraba State.", body_style))
    story.append(Paragraph("Key Objectives of the Platform:", h3_style))
    story.append(Paragraph("• <b>Eliminate Ghost Workers:</b> Integration with the National Identity Management Commission (NIMC) via National Identification Number (NIN) verification guarantees identity authenticity.", bullet_style))
    story.append(Paragraph("• <b>Streamline Payroll & Service Records:</b> Automated capture of Grade Levels, Steps, Service Numbers, Cadres, PFA pension data, and Bank Account (NUBAN) details.", bullet_style))
    story.append(Paragraph("• <b>Centralized Document Repository:</b> Secure digital archiving of educational certificates, birth certificates, letter of first appointment, and promotion notices.", bullet_style))
    story.append(Paragraph("• <b>Granular Administrative Governance:</b> Role-Based Access Control (RBAC) enabling designated officers to inspect, audit, approve, or decline employee records.", bullet_style))

    story.append(Spacer(1, 10))

    # SECTION 2
    story.append(Paragraph("2. Architecture & Access Roles", h1_style))
    story.append(Paragraph("The portal enforces strict separation of concerns across public self-service portals and restricted administrative dashboards:", body_style))

    roles_table_data = [
        [Paragraph("Role", table_header_style), Paragraph("Target User", table_header_style), Paragraph("Access Level & Key Capabilities", table_header_style)],
        [
            Paragraph("<b>Public / Employee</b>", table_cell_style),
            Paragraph("Civil Servants / Applicants", table_cell_style),
            Paragraph("Access to <code>/register</code> and <code>/track</code>. Can initiate self-verification, link NIN, submit credentials, and track verification progress.", table_cell_style)
        ],
        [
            Paragraph("<b>Verification Officer</b>", table_cell_style),
            Paragraph("MDA Audit Staff", table_cell_style),
            Paragraph("Access to Admin Employee Directory and Document Verification tabs. Can inspect files and mark credentials as Verified/Rejected.", table_cell_style)
        ],
        [
            Paragraph("<b>System Admin</b>", table_cell_style),
            Paragraph("Director of HR / ICT", table_cell_style),
            Paragraph("Full access to Dashboard, Bulk Import, File Manager, Global Settings, RBAC Role Management, and User Permission controls.", table_cell_style)
        ],
        [
            Paragraph("<b>Super Admin</b>", table_cell_style),
            Paragraph("Head of Service / Governor's Office", table_cell_style),
            Paragraph("Global system control, audit log inspection, system settings override, and role permission assignments.", table_cell_style)
        ],
    ]
    t_roles = Table(roles_table_data, colWidths=[100, 110, 250])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D1D5DB")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_roles)

    story.append(PageBreak())

    # SECTION 3: EMPLOYEE SELF VERIFICATION
    story.append(Paragraph("3. Module 1: Employee Self-Verification Guide", h1_style))
    story.append(Paragraph("Civil servants can access the verification portal at <code>/register</code> to submit their bio-data, identity credentials, and official employment history.", body_style))
    
    # Callout Box
    callout_data = [[
        Paragraph("<b>Important Prerequisite:</b> Employees must have a valid 11-digit National Identification Number (NIN), Bank Verification Number (BVN), clear digital copies of credentials, and active email address before starting.", callout_style)
    ]]
    t_callout = Table(callout_data, colWidths=[460])
    t_callout.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")), # Light Blue
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#93C5FD")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_callout)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.1 Step 1: NIN Verification & Biometric Identity Lookup", h2_style))
    story.append(Paragraph("1. Navigate to the Registration Portal page at <code>/register</code>.", bullet_style))
    story.append(Paragraph("2. Enter your <b>11-digit NIN</b> into the NIN verification box.", bullet_style))
    story.append(Paragraph("3. Click the green <b>'Verify NIN'</b> button. This triggers the integrated NIMC identity check dialog.", bullet_style))
    story.append(Paragraph("4. Once identity is matched successfully, the system automatically populates verified official identity data (Full Name, Date of Birth, Gender, LGA of Origin) directly into your registration form.", bullet_style))

    story.append(Paragraph("3.2 Step 2: Personal Information Entry", h2_style))
    story.append(Paragraph("Provide comprehensive personal information in the designated input fields:", body_style))

    personal_fields = [
        [Paragraph("Field Name", table_header_style), Paragraph("Description & Format", table_header_style), Paragraph("Requirement", table_header_style)],
        [Paragraph("<b>First & Last Name</b>", table_cell_style), Paragraph("Legal name matching NIN records exactly.", table_cell_style), Paragraph("Mandatory", table_cell_style)],
        [Paragraph("<b>Email Address</b>", table_cell_style), Paragraph("Active personal/official email for status notifications.", table_cell_style), Paragraph("Mandatory", table_cell_style)],
        [Paragraph("<b>Phone Number</b>", table_cell_style), Paragraph("11-digit Nigerian telephone number (e.g. 08031234567).", table_cell_style), Paragraph("Mandatory", table_cell_style)],
        [Paragraph("<b>State & LGA of Origin</b>", table_cell_style), Paragraph("Taraba State LGA selection (e.g. Jalingo, Wukari, Bali, Sardauna).", table_cell_style), Paragraph("Mandatory", table_cell_style)],
        [Paragraph("<b>Residential Address</b>", table_cell_style), Paragraph("Current residential location in Taraba State.", table_cell_style), Paragraph("Mandatory", table_cell_style)],
    ]
    t_personal = Table(personal_fields, colWidths=[130, 230, 100])
    t_personal.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_personal)

    story.append(Spacer(1, 10))

    story.append(Paragraph("3.3 Step 3: Employment Details & Service History", h2_style))
    story.append(Paragraph("In Step 3 of the wizard, enter your official civil service employment details:", body_style))
    story.append(Paragraph("• <b>Ministry / Department / Agency (MDA):</b> Select your current station or ministry (e.g. Ministry of Education, Health, Agriculture, Post Primary Schools Management Board).", bullet_style))
    story.append(Paragraph("• <b>Staff ID / Service Number:</b> Unique civil service identifier (e.g. TS/EMP/2026/042).", bullet_style))
    story.append(Paragraph("• <b>Designation / Rank & Cadre:</b> Current official title (e.g. Senior Administrative Officer, Education Officer I).", bullet_style))
    story.append(Paragraph("• <b>Grade Level & Step:</b> Select GL 01 to GL 17 and Step 01 to 15.", bullet_style))
    story.append(Paragraph("• <b>Date of First Appointment & Last Promotion:</b> Official dates recorded in your service book.", bullet_style))
    story.append(Paragraph("• <b>Bank Account & Pension Details:</b> Enter your 10-digit NUBAN account number, Bank Name, PFA Name, and RSA PIN number.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("3.4 Step 4: Credential & Document Upload", h2_style))
    story.append(Paragraph("Upload legible, scan-quality PDF or Image files (PNG/JPG up to 5MB each) for mandatory document verification:", body_style))
    story.append(Paragraph("1. <b>National Identity Card / Slip (NIN)</b>", bullet_style))
    story.append(Paragraph("2. <b>Letter of First Appointment</b>", bullet_style))
    story.append(Paragraph("3. <b>Letter of Confirmation / Present Promotion</b>", bullet_style))
    story.append(Paragraph("4. <b>Highest Educational Certificate (FSLC, SSCE, NCE, HND, BSc)</b>", bullet_style))
    story.append(Paragraph("5. <b>Birth Certificate / Declaration of Age</b>", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("3.5 Step 5: Final Review & Registration Slip Generation", h2_style))
    story.append(Paragraph("Cross-check all information on the summary review screen. Upon clicking <b>'Submit Registration'</b>:", body_style))
    story.append(Paragraph("• The system generates a unique <b>Registration Number</b> (e.g., <code>TSG-VER-894120</code>).", bullet_style))
    story.append(Paragraph("• A downloadable/printable official <b>Verification Acknowledgment Slip</b> with QR Code is generated instantly.", bullet_style))
    story.append(Paragraph("• An email acknowledgment containing your tracking code is dispatched to your email address.", bullet_style))

    story.append(PageBreak())

    # SECTION 4: TRACKING APPLICATION STATUS
    story.append(Paragraph("4. Module 2: Tracking Application Status", h1_style))
    story.append(Paragraph("Employees can monitor the status of their verification request at any time by navigating to <code>/track</code>.", body_style))

    story.append(Paragraph("4.1 Lookup via Registration Number / Staff ID or Email", h2_style))
    story.append(Paragraph("1. Open <code>/track</code> on any mobile browser or desktop computer.", bullet_style))
    story.append(Paragraph("2. Choose search tab: <b>'By Registration / Staff ID'</b> or <b>'By Email Address'</b>.", bullet_style))
    story.append(Paragraph("3. Enter your unique ID or email and click <b>'Track Verification'</b>.", bullet_style))

    story.append(Spacer(1, 8))

    # Status Table
    status_data = [
        [Paragraph("Status Badge", table_header_style), Paragraph("Meaning & Current Stage", table_header_style), Paragraph("Required Action", table_header_style)],
        [
            Paragraph("<b>Pending Review</b>", ParagraphStyle("s1", parent=table_cell_style, textColor=colors.HexColor("#D97706"))),
            Paragraph("Application submitted successfully. Awaiting MDA verification officer review.", table_cell_style),
            Paragraph("No action needed. Check back periodically.", table_cell_style)
        ],
        [
            Paragraph("<b>NIN Verified</b>", ParagraphStyle("s2", parent=table_cell_style, textColor=colors.HexColor("#2563EB"))),
            Paragraph("Identity confirmed via NIMC. Awaiting administrative credential clearance.", table_cell_style),
            Paragraph("No action needed.", table_cell_style)
        ],
        [
            Paragraph("<b>Approved & Active</b>", ParagraphStyle("s3", parent=table_cell_style, textColor=colors.HexColor("#059669"))),
            Paragraph("Record fully audited, verified, and enrolled in the state digital payroll directory.", table_cell_style),
            Paragraph("Download/Print official clearance certificate.", table_cell_style)
        ],
        [
            Paragraph("<b>Rejected / Flagged</b>", ParagraphStyle("s4", parent=table_cell_style, textColor=colors.HexColor("#DC2626"))),
            Paragraph("Discrepancy detected in documents or bio-data during admin audit.", table_cell_style),
            Paragraph("Click <b>'Re-Verify NIN / Update Record'</b> to submit corrected credentials.", table_cell_style)
        ],
    ]
    t_status = Table(status_data, colWidths=[120, 220, 120])
    t_status.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D1D5DB")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_status)

    story.append(Spacer(1, 10))

    story.append(Paragraph("4.2 Online Re-Verification & Post-Submission Update", h2_style))
    story.append(Paragraph("If an employee record has an unverified NIN or needs corrections, the employee can click <b>'Verify NIN Now'</b> on the tracking result page. This launches the modal dialog to complete identity confirmation without having to re-fill the full form.", body_style))

    story.append(Spacer(1, 15))

    # SECTION 5: ADMIN PANEL
    story.append(Paragraph("5. Module 3: Admin Panel Comprehensive Operational Guide", h1_style))
    story.append(Paragraph("The Administrative Portal at <code>/admin</code> empowers designated state verification officers, HR directors, and system administrators to oversee the complete civil service audit workflow.", body_style))

    story.append(Paragraph("5.1 Secure Administrator Login & Access Control", h2_style))
    story.append(Paragraph("1. Access the administrator sign-in page at <code>/auth/login</code>.", bullet_style))
    story.append(Paragraph("2. Input your assigned official admin email address and secure password.", bullet_style))
    story.append(Paragraph("3. Upon authentication, the system validates session tokens and loads administrative routes governed by your assigned role permissions.", bullet_style))

    story.append(Spacer(1, 8))

    story.append(Paragraph("5.2 Executive Dashboard & Real-Time Analytics (/admin/dashboard)", h2_style))
    story.append(Paragraph("The Executive Dashboard provides instantaneous macro-level visibility into state verification progress:", body_style))
    story.append(Paragraph("• <b>Metric Cards:</b> Displays Total Enrolled Employees, Active Verified Staff, Pending Applications, Flagged Discrepancies, and Total Archived Credentials.", bullet_style))
    story.append(Paragraph("• <b>Status Breakdown Visualizer:</b> Bar charts and percentage breakdowns comparing verified vs pending records across departments.", bullet_style))
    story.append(Paragraph("• <b>Recent System Activity Log:</b> Real-time feed of employee registrations, document approvals, role changes, and system settings modifications.", bullet_style))
    story.append(Paragraph("• <b>Quick Action Panel:</b> One-click access to add single employee, launch bulk CSV import, or review pending document queue.", bullet_style))

    story.append(PageBreak())

    story.append(Paragraph("5.3 Employee Management Directory & Filter Engine (/admin/employees)", h2_style))
    story.append(Paragraph("The primary employee management hub provides powerful data table capabilities:", body_style))
    story.append(Paragraph("• <b>Search Bar:</b> Real-time search across Employee Name, Email, NIN, Staff ID, or BVN.", bullet_style))
    story.append(Paragraph("• <b>Multi-Criteria Filtering:</b> Filter records by Department/MDA, Verification Status (Active, Pending, Rejected), Cadre, or LGA.", bullet_style))
    story.append(Paragraph("• <b>Employee Details Drawer:</b> Clicking on any employee opens a comprehensive profile view showing complete personal history, employment timeline, bank details, pension data, and uploaded document attachments.", bullet_style))
    story.append(Paragraph("• <b>Manual Record Addition (/admin/employees/add):</b> Allows administrative officers to register new civil servants directly with full validation checks.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("5.4 CSV / Excel Bulk Employee Data Import Tool", h2_style))
    story.append(Paragraph("To onboard existing MDA registers or teacher databases seamlessly:", body_style))
    story.append(Paragraph("1. Click <b>'Import CSV / Excel'</b> on the Employee Directory toolbar.", bullet_style))
    story.append(Paragraph("2. Download the official standardized template spreadsheet.", bullet_style))
    story.append(Paragraph("3. Populate required columns: <i>firstName, lastName, email, department, position, nin, bvn, salaryStructure, gradeLevel, step</i>.", bullet_style))
    story.append(Paragraph("4. Drag and drop the file into the upload zone. The system validates headers, flags duplicate NINs/emails, and executes bulk database creation with transaction rollback protection.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("5.5 Document Verification & Credential Audit Workflow (/admin/documents)", h2_style))
    story.append(Paragraph("The document audit console ensures every civil servant credential undergoes rigorous administrative inspection:", body_style))

    doc_workflow = [
        [Paragraph("Step", table_header_style), Paragraph("Action", table_header_style), Paragraph("System Effect", table_header_style)],
        [
            Paragraph("1. Select Document", table_cell_style),
            Paragraph("Officer clicks on pending document item from queue.", table_cell_style),
            Paragraph("Loads inline high-resolution previewer (PDF / Image).", table_cell_style)
        ],
        [
            Paragraph("2. Credential Audit", table_cell_style),
            Paragraph("Inspects certificate authenticity, dates, names, and seal.", table_cell_style),
            Paragraph("Compares credential data against employee profile history.", table_cell_style)
        ],
        [
            Paragraph("3. Status Decision", table_cell_style),
            Paragraph("Click <b>'Approve Document'</b> or <b>'Reject Document'</b>.", table_cell_style),
            Paragraph("Updates document badge to Verified/Rejected. Recalculates verified document count.", table_cell_style)
        ],
        [
            Paragraph("4. Audit Log", table_cell_style),
            Paragraph("Enter rejection reason if declining credential.", table_cell_style),
            Paragraph("Dispatches system notification to employee tracking dashboard.", table_cell_style)
        ],
    ]
    t_doc = Table(doc_workflow, colWidths=[90, 180, 190])
    t_doc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_doc)

    story.append(Spacer(1, 12))

    story.append(Paragraph("5.6 Enterprise File Manager & Folder Operations (/admin/files)", h2_style))
    story.append(Paragraph("The central File Manager module allows admins to organize government circulars, verification reports, and policy documents:", body_style))
    story.append(Paragraph("• <b>Folder Navigation:</b> Create nested folders with custom scopes (Global, Departmental, System).", bullet_style))
    story.append(Paragraph("• <b>File Upload & Storage:</b> Upload official documentation, archive templates, and audit reports.", bullet_style))
    story.append(Paragraph("• <b>Bulk Operations:</b> Rename, move, delete, or download archived files securely.", bullet_style))

    story.append(PageBreak())

    story.append(Paragraph("5.7 Role-Based Access Control (RBAC) & Custom Roles (/admin/roles)", h2_style))
    story.append(Paragraph("Security is governed by dynamic roles configured under <code>/admin/roles</code>:", body_style))
    story.append(Paragraph("• <b>Create Custom Role:</b> Click 'Add New Role', specify Role Name (e.g. <i>MDA Audit Supervisor</i>) and Description.", bullet_style))
    story.append(Paragraph("• <b>Permission Assignment:</b> Check specific permission boxes granted to the role.", bullet_style))
    story.append(Paragraph("• <b>Status Toggle:</b> Enable or disable administrative roles instantaneously without deleting historical audit logs.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("5.8 Granular Permissions Management Engine (/admin/permissions)", h2_style))
    story.append(Paragraph("System capabilities are organized into modular permissions across key functional modules:", body_style))

    perm_data = [
        [Paragraph("Module", table_header_style), Paragraph("Permission Key", table_header_style), Paragraph("Description & Capability", table_header_style)],
        [Paragraph("<b>Employees</b>", table_cell_style), Paragraph("<code>view_employees</code><br/><code>edit_employees</code><br/><code>delete_employees</code>", table_cell_style), Paragraph("Read employee directory, update bio-data, purge duplicate records.", table_cell_style)],
        [Paragraph("<b>Documents</b>", table_cell_style), Paragraph("<code>view_documents</code><br/><code>approve_documents</code>", table_cell_style), Paragraph("Access credential repository, approve or reject uploaded certificates.", table_cell_style)],
        [Paragraph("<b>System & Files</b>", table_cell_style), Paragraph("<code>manage_files</code><br/><code>manage_settings</code><br/><code>manage_roles</code>", table_cell_style), Paragraph("Full control over file manager, global branding, and RBAC security rules.", table_cell_style)],
    ]
    t_perm = Table(perm_data, colWidths=[100, 160, 200])
    t_perm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D1D5DB")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_perm)

    story.append(Spacer(1, 10))

    story.append(Paragraph("5.9 Global System Settings & Custom Branding (/admin/settings)", h2_style))
    story.append(Paragraph("System administrators can dynamically customize application appearance and global settings:", body_style))
    story.append(Paragraph("• <b>Global Application Name:</b> Change system display name (e.g. <i>Taraba State Verification Portal</i>). Changes propagate across headers, login titles, and document slips instantly.", bullet_style))
    story.append(Paragraph("• <b>Logo & Branding Upload:</b> Upload state emblem or custom seal logos.", bullet_style))
    story.append(Paragraph("• <b>Notification & Email Gateway:</b> Configure SMTP credentials and automated notification templates.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("5.10 Administrator Profile & Security Settings (/admin/profile)", h2_style))
    story.append(Paragraph("Administrators can update personal account details, change passwords securely using bcrypt encryption standards, and view recent security login timestamps under <code>/admin/profile</code>.", body_style))

    story.append(Spacer(1, 15))

    # SECTION 6: SECURITY & TROUBLESHOOTING
    story.append(Paragraph("6. Security, Compliance & System Troubleshooting", h1_style))
    story.append(Paragraph("<b>Security Best Practices:</b>", h3_style))
    story.append(Paragraph("1. Always log out of administrative sessions when leaving workstation unattended.", bullet_style))
    story.append(Paragraph("2. Do not share admin credentials; ensure each officer is assigned a individual role-based account.", bullet_style))
    story.append(Paragraph("3. Verify that uploaded credentials match NIN identity records before approving employee profiles.", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Common FAQs & Troubleshooting:</b>", h3_style))

    faq_data = [
        [Paragraph("Issue / Question", table_header_style), Paragraph("Root Cause", table_header_style), Paragraph("Recommended Solution", table_header_style)],
        [
            Paragraph("NIN Verification fails during registration.", table_cell_style),
            Paragraph("Network timeout or NIMC service downtime.", table_cell_style),
            Paragraph("Ensure 11-digit NIN is correct. Retry after 2 minutes or use manual review option.", table_cell_style)
        ],
        [
            Paragraph("Document upload error (File size too large).", table_cell_style),
            Paragraph("Uploaded file exceeds 5MB limit.", table_cell_style),
            Paragraph("Compress PDF or JPEG image below 5MB using standard compression software before re-uploading.", table_cell_style)
        ],
        [
            Paragraph("Employee status stuck on 'Pending'.", table_cell_style),
            Paragraph("Awaiting departmental audit review.", table_cell_style),
            Paragraph("Contact assigned MDA Verification Officer to audit documents in <code>/admin/documents</code>.", table_cell_style)
        ],
        [
            Paragraph("Admin password forgotten.", table_cell_style),
            Paragraph("Credential lockout.", table_cell_style),
            Paragraph("Contact System Administrator or execute password reset via database CLI script.", table_cell_style)
        ],
    ]
    t_faq = Table(faq_data, colWidths=[140, 140, 180])
    t_faq.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    story.append(t_faq)

    story.append(Spacer(1, 25))
    story.append(Paragraph("<b>Technical Support & Inquiries:</b><br/>For administrative support, bug reports, or system access requests, contact the <b>Taraba State Bureau of Information Technology (BIT)</b> at <code>support@tarabastate.gov.ng</code>.", ParagraphStyle("SupportFooter", fontName="Helvetica", fontSize=9, leading=13, textColor=dark_neutral, alignment=TA_CENTER)))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully generated at: {filename}")

if __name__ == "__main__":
    out_path = os.path.join(os.getcwd(), "Taraba_State_Verification_Portal_User_Manual.pdf")
    build_pdf(out_path)
