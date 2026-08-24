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
    const selfVerifiedCount = employees.filter((emp) => emp.status === "Self-Verified").length;

    return NextResponse.json({
      success: true,
      data: employees,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        pending: pendingCount,
        selfVerified: selfVerifiedCount,
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

    // Check for duplicate email
    let finalEmail = data.email;
    const existing = await prisma.employee.findUnique({
      where: { email: finalEmail }
    });
    if (existing) {
      const parts = finalEmail.split("@");
      finalEmail = `${parts[0]}+dup${Date.now()}-${Math.random().toString(36).substring(7)}@${parts[1] || "example.com"}`;
    }

    const newEmployee = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: finalEmail,
        department: data.department || "Unassigned",
        position: data.position || "Staff",
        status: data.status || "Pending",

        // Ministry Categorization
        ministry: data.ministry,

        // Personal Details
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

        // Next of Kin
        nokName: data.nokName,
        nokRelationship: data.nokRelationship,
        nokPhone: data.nokPhone,
        nokAddress: data.nokAddress,

        // Employment Record
        employmentId: data.employmentId,
        serviceNo: data.serviceNo,
        fileNo: data.fileNo,
        rank: data.rank,
        organization: data.organization,
        employmentType: data.employmentType,
        probationPeriod: data.probationPeriod,

        // Employment Details
        workLocation: data.workLocation,
        dateOfFirstAppointment: data.dateOfFirstAppointment ? new Date(data.dateOfFirstAppointment) : null,
        salaryStructure: data.salaryStructure,
        gradeLevel: data.gradeLevel,
        step: data.step,
        cadre: data.cadre,

        // Banking and Pension
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        nuban: data.nuban,
        pfaName: data.pfaName,
        rsaPin: data.rsaPin,

        // Education
        educationalBackground: data.educationalBackground,
        certifications: data.certifications,
        dateOfGraduation: data.dateOfGraduation,

        // Verification
        ninVerified: data.ninVerified || false,
        ninData: data.ninData || null,

        // Teacher CSV Import Fields (Ministry of Education)
        currentStation: data.currentStation,
        dateOfLastPromotion: data.dateOfLastPromotion,
        lgaOfOrigin: data.lgaOfOrigin,
        nationality: data.nationality,
        highestQualification: data.highestQualification,
        subjectTaught: data.subjectTaught,
        bvn: data.bvn,
        standardizedLga: data.standardizedLga,
        standardizedSex: data.standardizedSex,
        standardizedCadre: data.standardizedCadre,
        duplicateFlag: data.duplicateFlag,
        sharedIdentifierFlag: data.sharedIdentifierFlag,

        // Health Facilities CSV Import Fields (Ministry of Health)
        maidenName: data.maidenName,
        areYouNigerian: data.areYouNigerian,
        senatoralWardOfOrigin: data.senatoralWardOfOrigin,
        wardOfOrigin: data.wardOfOrigin,
        country: data.country,
        mobileNo: data.mobileNo,
        permanentAddress: data.permanentAddress,
        permanentState: data.permanentState,
        permanentLga: data.permanentLga,

        // Health Professional Registration
        mdcnRegNo: data.mdcnRegNo,
        professionalRegBody: data.professionalRegBody,
        professionalRegNo: data.professionalRegNo,
        licenseIssuanceDate: data.licenseIssuanceDate,
        nurseSpecialization: data.nurseSpecialization,
        practitionerType: data.practitionerType,

        // Health Facility Appointment Details
        appointmentType: data.appointmentType,
        presentPosting: data.presentPosting,
        dateOfConfirmation: data.dateOfConfirmation ? new Date(data.dateOfConfirmation) : null,
        dateOfPresentAppointment: data.dateOfPresentAppointment ? new Date(data.dateOfPresentAppointment) : null,

        // Facility Info
        facilityName: data.facilityName,
        facilityType: data.facilityType,
        branch: data.branch,

        // Submission / Import Metadata
        submissionId: data.submissionId,
        validationStatus: data.validationStatus,
        importNotes: data.importNotes,
        importSource: data.importSource,
        importVersion: data.importVersion,
        importTags: data.importTags,
      },
    });

    await prisma.activity.create({
      data: {
        title: "New Employee Added",
        description: `${newEmployee.firstName} ${newEmployee.lastName} was added to ${newEmployee.department} department.`,
        type: "Employee",
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
