import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const employeeId = resolvedParams.id;
    
    // Find employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    if (employee.status === "Active") {
      return NextResponse.json({ success: false, error: "Employee is already verified/active" }, { status: 400 });
    }

    // Update status to Active
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { status: "Active" },
    });

    // Send Verification Email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const receiptUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/employees/${employeeId}/receipt`;

      const mailOptions = {
        from: `"Taraba State Verification Portal" <${process.env.SMTP_USER || "noreply@tarabastate.gov.ng"}>`,
        to: employee.email,
        subject: "Verification Successful - Action Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #00894F; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Verification Successful</h1>
            </div>
            <div style="padding: 30px;">
              <p>Dear ${employee.firstName} ${employee.lastName},</p>
              <p>We are pleased to inform you that your profile has been successfully verified on the Taraba State Verification Portal.</p>
              <p>Your official Verification Receipt is now ready to be printed and signed.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${receiptUrl}" style="background-color: #00894F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View & Print Verification Receipt</a>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Click the button above to view your receipt.</li>
                <li>Print the receipt (ensure background graphics are enabled).</li>
                <li>Sign your portion of the receipt.</li>
                <li>Have your Supervisor/Head of Unit and the MDA Representative sign their respective sections.</li>
              </ol>
              
              <p>Thank you,<br>Taraba State Verification Portal Team</p>
            </div>
          </div>
        `,
      };

      // Only attempt to send if SMTP_USER is configured, otherwise just log
      if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${employee.email}`);
      } else {
        console.log(`[Email Simulation] Verification email would have been sent to ${employee.email}`);
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // We still want to return success because the DB update worked
    }

    // Log Activity
    try {
      await prisma.activity.create({
        data: {
          title: "Employee Verified",
          description: `${updatedEmployee.firstName} ${updatedEmployee.lastName} was verified and moved to Active status.`,
          type: "Verification",
          status: "Completed",
        },
      });
    } catch (e) {
      console.error("Failed to log activity", e);
    }

    return NextResponse.json({ success: true, data: updatedEmployee });
  } catch (error) {
    console.error("Error verifying employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify employee" },
      { status: 500 }
    );
  }
}
