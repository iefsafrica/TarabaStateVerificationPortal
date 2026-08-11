import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

function generateRegistrationNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TSV-${year}-${random}`;
}

async function getSettings(): Promise<Record<string, string>> {
  try {
    const settings = await (prisma.systemSettings as any).findMany();
    return Object.fromEntries(settings.map((s: any) => [s.key, s.value]));
  } catch {
    return {};
  }
}

async function sendConfirmationEmail(
  registration: any,
  settings: Record<string, string>
) {
  if (settings["email_enabled"] !== "true") return;

  const host = settings["smtp_host"];
  const port = parseInt(settings["smtp_port"] || "587");
  const user = settings["smtp_user"];
  const pass = settings["smtp_pass"];
  const fromName = settings["smtp_from_name"] || "Taraba State Verification Portal";
  const fromEmail = settings["smtp_from_email"] || user;

  if (!host || !user || !pass) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: registration.email,
    subject: `Registration Confirmed – ${registration.registrationNo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #15803d; margin: 0;">Taraba State Verification Portal</h1>
          <p style="color: #64748b; margin: 4px 0;">Registration Confirmation</p>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center;">
          <p style="color: #166534; font-size: 14px; margin: 0 0 8px 0;">Your Registration Number</p>
          <h2 style="color: #15803d; font-size: 28px; margin: 0; letter-spacing: 2px;">${registration.registrationNo}</h2>
          <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">Please keep this number for your records</p>
        </div>
        <h3 style="color: #1e293b;">Dear ${registration.firstName} ${registration.lastName},</h3>
        <p style="color: #475569;">Your registration on the Taraba State Government Verification Portal has been received and is pending review.</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; color: #64748b; font-size: 13px; width: 40%;">Registration No.</td><td style="padding: 8px 12px; color: #1e293b;">${registration.registrationNo}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #64748b; font-size: 13px;">Full Name</td><td style="padding: 8px 12px; color: #1e293b;">${registration.firstName} ${registration.middleName || ""} ${registration.lastName}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; color: #64748b; font-size: 13px;">Department</td><td style="padding: 8px 12px; color: #1e293b;">${registration.department || "—"}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #64748b; font-size: 13px;">Designation</td><td style="padding: 8px 12px; color: #1e293b;">${registration.designation || "—"}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 8px 12px; font-weight: bold; color: #64748b; font-size: 13px;">Status</td><td style="padding: 8px 12px; color: #d97706; font-weight: bold;">Pending Review</td></tr>
        </table>
        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">You will be notified once your application has been reviewed by the appropriate authority.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Taraba State Verification Portal. All rights reserved.</p>
      </div>
    `,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bvn, nin, firstName, lastName, middleName,
      email, phone, dateOfBirth, gender, address,
      department, designation, employeeId, grade,
      dateOfEmployment, ninVerified
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Generate unique registration number
    let registrationNo = generateRegistrationNo();
    // Ensure uniqueness
    let exists = true;
    while (exists) {
      const found = await (prisma.registration as any).findUnique({ where: { registrationNo } });
      if (!found) exists = false;
      else registrationNo = generateRegistrationNo();
    }

    const registration = await (prisma.registration as any).create({
      data: {
        registrationNo,
        bvn, nin, firstName, lastName, middleName,
        email, phone, dateOfBirth, gender, address,
        department, designation, employeeId, grade,
        dateOfEmployment, ninVerified: !!ninVerified,
        status: "Pending",
      }
    });

    // Log activity
    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `New registration: ${firstName} ${lastName} (${registrationNo})`,
          type: "System",
          status: "Success",
        }
      });
    }

    // Send email (non-blocking)
    const settings = await getSettings();
    sendConfirmationEmail(registration, settings).catch(console.error);

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit registration" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const registrations = await (prisma.registration as any).findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
