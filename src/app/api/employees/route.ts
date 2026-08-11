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
