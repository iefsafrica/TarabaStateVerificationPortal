import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationNo = searchParams.get("registrationNo");
    const email = searchParams.get("email");

    if (!registrationNo && !email) {
      return NextResponse.json(
        { success: false, error: "Please provide a registration number or email." },
        { status: 400 }
      );
    }

    let registration: any = null;

    if (registrationNo) {
      registration = await (prisma.registration as any).findUnique({
        where: { registrationNo: registrationNo.trim().toUpperCase() }
      });
    } else if (email) {
      registration = await (prisma.registration as any).findFirst({
        where: { email: email.trim().toLowerCase() },
        orderBy: { createdAt: "desc" }
      });
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "No registration found with the provided details." },
        { status: 404 }
      );
    }

    // Return safe fields only (no BVN/NIN full numbers)
    return NextResponse.json({
      success: true,
      data: {
        registrationNo: registration.registrationNo,
        firstName: registration.firstName,
        lastName: registration.lastName,
        middleName: registration.middleName,
        email: registration.email,
        phone: registration.phone,
        department: registration.department,
        designation: registration.designation,
        grade: registration.grade,
        status: registration.status,
        ninVerified: registration.ninVerified,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
      }
    });
  } catch (error) {
    console.error("Track registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track registration." },
      { status: 500 }
    );
  }
}
