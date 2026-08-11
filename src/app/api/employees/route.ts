import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCount = employees.length;
    const activeCount = employees.filter((emp) => emp.status === "Active").length;
    const inactiveCount = employees.filter((emp) => emp.status === "Inactive").length;
    const pendingCount = employees.filter((emp) => emp.status === "Pending").length;

    return NextResponse.json({
      success: true,
      data: employees,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        pending: pendingCount,
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("POST /api/employees HIT");
  try {
    const data = await request.json();
    console.log("POST /api/employees Payload:", JSON.stringify(data).substring(0, 100));

    // Basic validation for required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (firstName, lastName, email)" },
        { status: 400 }
      );
    }

    const newEmployee = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        department: data.department || "Unassigned",
        position: data.position || "Staff",
        status: data.status || "Active",
        
        middleName: data.middleName,
        title: data.title,
        telephone: data.telephone,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        nin: data.nin,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        stateOfOrigin: data.stateOfOrigin,
        residentialAddress: data.residentialAddress,
        stateOfResidence: data.stateOfResidence,
        lga: data.lga,
        profession: data.profession,
        
        nokName: data.nokName,
        nokRelationship: data.nokRelationship,
        nokPhone: data.nokPhone,
        nokAddress: data.nokAddress,
        
        employmentId: data.employmentId,
        serviceNo: data.serviceNo,
        fileNo: data.fileNo,
        rank: data.rank,
        organization: data.organization,
        employmentType: data.employmentType,
        probationPeriod: data.probationPeriod,
        
        workLocation: data.workLocation,
        dateOfFirstAppointment: data.dateOfFirstAppointment ? new Date(data.dateOfFirstAppointment) : null,
        salaryStructure: data.salaryStructure,
        gradeLevel: data.gradeLevel,
        step: data.step,
        cadre: data.cadre,
        
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        nuban: data.nuban,
        pfaName: data.pfaName,
        rsaPin: data.rsaPin,
        
        educationalBackground: data.educationalBackground,
        certifications: data.certifications,

        ninVerified: data.ninVerified || false,
        ninData: data.ninData || null,
      },
    });

    return NextResponse.json({ success: true, data: newEmployee });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
