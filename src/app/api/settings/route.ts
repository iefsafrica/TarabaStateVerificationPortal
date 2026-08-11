import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

const SETTINGS_KEYS = [
  "email_enabled",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_from_name",
  "smtp_from_email",
];

export async function GET() {
  try {
    const rows = await (prisma.systemSettings as any).findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    for (const key of SETTINGS_KEYS) {
      if (body[key] !== undefined) {
        await (prisma.systemSettings as any).upsert({
          where: { key },
          update: { value: String(body[key]), updatedAt: new Date() },
          create: { key, value: String(body[key]), updatedAt: new Date() },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Test email endpoint
  try {
    const body = await request.json();
    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email, test_email } = body;

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: parseInt(smtp_port || "587"),
      secure: parseInt(smtp_port) === 465,
      auth: { user: smtp_user, pass: smtp_pass },
    });

    await transporter.sendMail({
      from: `"${smtp_from_name || "Test"}" <${smtp_from_email || smtp_user}>`,
      to: test_email,
      subject: "Test Email – Taraba State Verification Portal",
      html: `<p>This is a test email from the <strong>Taraba State Verification Portal</strong>. Your SMTP configuration is working correctly!</p>`,
    });

    return NextResponse.json({ success: true, message: "Test email sent successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to send test email" }, { status: 500 });
  }
}
