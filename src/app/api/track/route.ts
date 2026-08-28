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
      if (prisma.registration) {
        try {
          registration = await (prisma.registration as any).findUnique({
            where: { registrationNo: registrationNo.trim().toUpperCase() }
          });
        } catch {
          registration = null;
        }
      }
      // Fallback: check serviceNo/employmentId/id in Employee table
      if (!registration && prisma.employee) {
        const emp = await (prisma.employee as any).findFirst({
          where: {
            OR: [
              { employmentId: registrationNo.trim() },
              { serviceNo: registrationNo.trim() },
              { id: registrationNo.trim() },
              { fileNo: registrationNo.trim() },
              { bvn: registrationNo.trim() },
              { nin: registrationNo.trim() }
            ]
          }
        });
        if (emp) {
          registration = {
            id: emp.id,
            registrationNo: emp.fileNo || emp.employmentId || emp.serviceNo || `EMP-${emp.id.slice(0, 8).toUpperCase()}`,
            firstName: emp.firstName,
            lastName: emp.lastName,
            middleName: emp.middleName,
            email: emp.email,
            phone: emp.telephone,
            department: emp.department,
            designation: emp.position,
            grade: emp.gradeLevel,
            status: emp.status || "Active",
            ninVerified: emp.ninVerified || false,
            createdAt: emp.createdAt,
            updatedAt: emp.updatedAt,
            // Additional imported details
            currentStation: emp.currentStation,
            lga: emp.lga,
            gender: emp.gender || emp.standardizedSex,
            cadre: emp.cadre || emp.standardizedCadre,
            birthdate: emp.birthdate,
            dateOfFirstAppointment: emp.dateOfFirstAppointment,
            dateOfLastPromotion: emp.dateOfLastPromotion,
            lgaOfOrigin: emp.lgaOfOrigin,
            nationality: emp.nationality,
            rank: emp.rank,
            highestQualification: emp.highestQualification,
            stateOfOrigin: emp.stateOfOrigin,
            subjectTaught: emp.subjectTaught,
            bankName: emp.bankName,
            accountNumber: emp.accountNumber,
            bvn: emp.bvn,
            nin: emp.nin,
          };
        }
      }
    } else if (email) {
      if (prisma.registration) {
        try {
          registration = await (prisma.registration as any).findFirst({
            where: {
              email: {
                equals: email.trim(),
                mode: "insensitive",
              },
            },
            orderBy: { createdAt: "desc" }
          });
        } catch {
          registration = null;
        }
      }

      // Fallback: check Employee table if not in Registration table
      if (!registration && prisma.employee) {
        const emp = await (prisma.employee as any).findFirst({
          where: {
            email: {
              equals: email.trim(),
              mode: "insensitive",
            },
          },
          orderBy: { createdAt: "desc" }
        });
        if (emp) {
          registration = {
            id: emp.id,
            registrationNo: emp.fileNo || emp.employmentId || emp.serviceNo || `EMP-${emp.id.slice(0, 8).toUpperCase()}`,
            firstName: emp.firstName,
            lastName: emp.lastName,
            middleName: emp.middleName,
            email: emp.email,
            phone: emp.telephone,
            department: emp.department,
            designation: emp.position,
            grade: emp.gradeLevel,
            status: emp.status || "Active",
            ninVerified: emp.ninVerified || false,
            createdAt: emp.createdAt,
            updatedAt: emp.updatedAt,
            // Additional imported details
            currentStation: emp.currentStation,
            lga: emp.lga,
            gender: emp.gender || emp.standardizedSex,
            cadre: emp.cadre || emp.standardizedCadre,
            birthdate: emp.birthdate,
            dateOfFirstAppointment: emp.dateOfFirstAppointment,
            dateOfLastPromotion: emp.dateOfLastPromotion,
            lgaOfOrigin: emp.lgaOfOrigin,
            nationality: emp.nationality,
            rank: emp.rank,
            highestQualification: emp.highestQualification,
            stateOfOrigin: emp.stateOfOrigin,
            subjectTaught: emp.subjectTaught,
            bankName: emp.bankName,
            accountNumber: emp.accountNumber,
            bvn: emp.bvn,
            nin: emp.nin,
          };
        }
      }
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
        id: registration.id,
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
