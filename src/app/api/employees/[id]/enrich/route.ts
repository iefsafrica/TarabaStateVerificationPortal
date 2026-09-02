import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH /api/employees/[id]/enrich
// Only fills in fields that are currently null/empty — never overwrites existing data.
// Used by the CSV import upsert flow to enrich existing employee records.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incoming = await request.json();

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    // Build update payload: only include a field if the existing record has no value for it
    const enrichData: any = {};

    const enrichableFields = [
      "firstName", "lastName", "middleName", "title", "gender", "maritalStatus",
      "birthdate", "nin", "telephone", "mobileNo", "stateOfOrigin", "lga", "lgaOfOrigin",
      "residentialAddress", "stateOfResidence", "nationality", "profession",
      // Employment
      "department", "position", "gradeLevel", "step", "cadre", "rank",
      "employmentId", "serviceNo", "fileNo", "organization", "employmentType",
      "workLocation", "dateOfFirstAppointment", "salaryStructure",
      // Dates
      "dateOfLastPromotion", "dateOfConfirmation", "dateOfPresentAppointment",
      // Banking
      "bankName", "accountNumber", "nuban", "bvn", "pfaName", "rsaPin",
      // Education
      "highestQualification", "educationalBackground", "certifications", "dateOfGraduation",
      // Teacher CSV fields
      "currentStation", "subjectTaught", "standardizedLga", "standardizedSex",
      "standardizedCadre", "duplicateFlag", "sharedIdentifierFlag",
      // Health fields
      "maidenName", "areYouNigerian", "senatoralWardOfOrigin", "wardOfOrigin", "country",
      "permanentAddress", "permanentState", "permanentLga",
      "mdcnRegNo", "professionalRegBody", "professionalRegNo", "licenseIssuanceDate",
      "nurseSpecialization", "practitionerType", "appointmentType", "presentPosting",
      "facilityName", "facilityType", "branch",
      // Metadata
      "ministry", "submissionId", "validationStatus", "importNotes",
      "importSource", "importVersion", "importTags",
      // NOK
      "nokName", "nokRelationship", "nokPhone", "nokAddress",
    ];

    for (const field of enrichableFields) {
      const existingVal = (existing as any)[field];
      const incomingVal = incoming[field];
      // Only set if incoming has a value AND existing is null/empty
      if (
        incomingVal !== undefined &&
        incomingVal !== null &&
        incomingVal !== "" &&
        (existingVal === null || existingVal === undefined || existingVal === "")
      ) {
        enrichData[field] = incomingVal;
      }
    }

    // Handle date fields that come in as strings
    const dateFields = ["birthdate", "dateOfFirstAppointment", "dateOfConfirmation", "dateOfPresentAppointment"];
    for (const df of dateFields) {
      if (enrichData[df] && typeof enrichData[df] === "string") {
        const parsed = new Date(enrichData[df]);
        enrichData[df] = isNaN(parsed.getTime()) ? null : parsed;
      }
    }

    if (Object.keys(enrichData).length === 0) {
      // Nothing new to add — all fields already populated
      return NextResponse.json({ success: true, data: existing, enriched: 0 });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: enrichData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      enriched: Object.keys(enrichData).length,
    });
  } catch (error: any) {
    console.error("Enrich error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to enrich employee" },
      { status: 500 }
    );
  }
}
