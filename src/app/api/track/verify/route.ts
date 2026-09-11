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

    const registration = !employee ? await prisma.registration.findUnique({
      where: { id: employeeId }
    }) : null;

    if (!employee && !registration) {
      return NextResponse.json({ success: false, error: "Record not found." }, { status: 404 });
    }

    const dateFields = ["birthdate", "dateOfFirstAppointment", "dateOfConfirmation", "dateOfPresentAppointment"];
    for (const df of dateFields) {
      if (updatedData[df] && typeof updatedData[df] === "string") {
        const parsed = new Date(updatedData[df]);
        updatedData[df] = isNaN(parsed.getTime()) ? null : parsed;
      }
    }

    const { phone, designation, grade, ...restData } = updatedData;
    let updatedRecord: any = null;
    let emailTo = "";
    let firstNameTo = "";
    let ninTo = "";

    if (employee) {
      // It's an Employee record
      updatedRecord = await prisma.employee.update({
        where: { id: employeeId },
        data: {
          ...restData,
          ...(phone !== undefined && { telephone: phone }),
          ...(designation !== undefined && { position: designation }),
          ...(grade !== undefined && { gradeLevel: grade }),
          ninVerified: true,
          status: "Self-Verified"
        }
      });
      emailTo = updatedRecord.email;
      firstNameTo = updatedRecord.firstName;
      ninTo = updatedRecord.nin;

      await prisma.activity.create({
        data: {
          title: "Frontend NIN Verification",
          description: `${updatedRecord.firstName} ${updatedRecord.lastName} verified their NIN and updated profile from frontend.`,
          type: "System",
          status: "Completed",
        },
      });
    } else if (registration) {
      // It's a Registration record
      // Registration model doesn't have all the new imported fields natively (like bankName, lga, etc)
      // but we update what we can.
      const validRegData = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        middleName: updatedData.middleName,
        email: updatedData.email,
        phone: updatedData.phone || phone,
        gender: updatedData.gender,
        department: updatedData.department,
        designation: updatedData.designation || designation,
        grade: updatedData.grade || grade,
        bvn: updatedData.bvn,
        nin: updatedData.nin,
        photo: updatedData.photo,
        ninVerified: true,
        status: "Self-Verified"
      };

      // Only include defined keys
      const cleanRegData = Object.fromEntries(Object.entries(validRegData).filter(([_, v]) => v !== undefined));

      updatedRecord = await prisma.registration.update({
        where: { id: employeeId },
        data: cleanRegData
      });
      emailTo = updatedRecord.email;
      firstNameTo = updatedRecord.firstName;
      ninTo = updatedRecord.nin;

      await prisma.activity.create({
        data: {
          title: "Frontend NIN Verification",
          description: `${updatedRecord.firstName} ${updatedRecord.lastName} verified their NIN on Registration record.`,
          type: "System",
          status: "Completed",
        },
      });
    }

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
            <p>Dear ${updatedRecord.firstName},</p>
            <p>Your NIN verification has been completed successfully via the Taraba State Self-Service Portal.</p>
            <div style="background-color: white; border-radius: 6px; padding: 15px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p><strong>NIN:</strong> ${updatedRecord.nin}</p>
              <p><strong>Name:</strong> ${updatedRecord.firstName} ${updatedRecord.lastName}</p>
              <p><strong>Email:</strong> ${updatedRecord.email}</p>
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
        to: updatedRecord.email,
        subject: "Verification Successful - Receipt",
        html: receiptHTML,
      });
    } catch (emailError) {
      console.error("Email notification failed (Track Verify):", emailError);
    }

    return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 });

  } catch (error) {
    console.error("Error verifying NIN from track:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during verification." },
      { status: 500 }
    );
  }
}
