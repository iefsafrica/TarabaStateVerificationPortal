import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { employeeId, updatedData } = data;

    if (!employeeId) {
      return NextResponse.json({ success: false, error: "Employee ID is required." }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found." }, { status: 404 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        ...updatedData,
        ninVerified: true,
        status: "Self-Verified"
      }
    });

    await prisma.activity.create({
      data: {
        title: "Frontend NIN Verification",
        description: `${updatedEmployee.firstName} ${updatedEmployee.lastName} verified their NIN and updated profile from frontend.`,
        type: "System",
        status: "Completed",
      },
    });

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const receiptHTML = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #047857; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Verification Receipt</h1>
          </div>
          <div style="padding: 30px; background-color: #f8fafc;">
            <p>Dear ${updatedEmployee.firstName},</p>
            <p>Your NIN verification has been completed successfully via the Taraba State Self-Service Portal.</p>
            <div style="background-color: white; border-radius: 6px; padding: 15px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p><strong>NIN:</strong> ${updatedEmployee.nin}</p>
              <p><strong>Name:</strong> ${updatedEmployee.firstName} ${updatedEmployee.lastName}</p>
              <p><strong>Email:</strong> ${updatedEmployee.email}</p>
              <p><strong>Status:</strong> Pending Final Approval</p>
            </div>
            <p>Your profile details have been sent to the admin team for final review and approval.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; ${new Date().getFullYear()} Taraba State Government. All rights reserved.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Taraba State Verification Portal" <${process.env.SMTP_USER || "noreply@tarabastate.gov.ng"}>`,
        to: updatedEmployee.email,
        subject: "Verification Successful - Receipt",
        html: receiptHTML,
      });
    } catch (emailError) {
      console.error("Email notification failed (Track Verify):", emailError);
    }

    return NextResponse.json({ success: true, data: updatedEmployee }, { status: 200 });

  } catch (error) {
    console.error("Error verifying NIN from track:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during verification." },
      { status: 500 }
    );
  }
}
