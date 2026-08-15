import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employeeId = (await params).id;
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found." }, { status: 404 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        status: "Active",
      },
    });

    await prisma.activity.create({
      data: {
        title: "Employee Approved",
        description: `${employee.firstName} ${employee.lastName}'s self-verified profile was approved and activated.`,
        type: "Employee",
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

      const approvalHTML = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #047857; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Profile Approved</h1>
          </div>
          <div style="padding: 30px; background-color: #f8fafc;">
            <p>Dear ${updatedEmployee.firstName},</p>
            <p>Your verified profile has been reviewed and officially <strong>Approved</strong> by the admin team.</p>
            <p>You are now marked as an Active staff member in the Taraba State Verification Portal.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; ${new Date().getFullYear()} Taraba State Government. All rights reserved.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Taraba State Verification Portal" <${process.env.SMTP_USER || "noreply@tarabastate.gov.ng"}>`,
        to: updatedEmployee.email,
        subject: "Profile Approved - Taraba State Portal",
        html: approvalHTML,
      });
    } catch (emailError) {
      console.error("Email notification failed (Approve):", emailError);
    }

    return NextResponse.json({ success: true, data: updatedEmployee });
  } catch (error) {
    console.error("Error approving employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve employee" },
      { status: 500 }
    );
  }
}
