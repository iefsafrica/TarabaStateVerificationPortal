import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/employees/lookup?nin=...&bvn=...&email=...&fileNo=...&serviceNo=...
// Returns the first employee that matches any of the provided identifiers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nin = searchParams.get("nin");
    const bvn = searchParams.get("bvn");
    const fileNo = searchParams.get("fileNo");
    const serviceNo = searchParams.get("serviceNo");
    const email = searchParams.get("email");

    const orClauses: any[] = [];
    if (nin) orClauses.push({ nin: nin.trim() });
    if (bvn) orClauses.push({ bvn: bvn.trim() });
    if (fileNo) orClauses.push({ fileNo: fileNo.trim() });
    if (serviceNo) orClauses.push({ serviceNo: serviceNo.trim() });
    if (email) orClauses.push({ email: { equals: email.trim(), mode: "insensitive" } });

    if (orClauses.length === 0) {
      return NextResponse.json({ success: false, error: "No lookup field provided" }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: { OR: orClauses },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json({ success: false, error: "Lookup failed" }, { status: 500 });
  }
}
