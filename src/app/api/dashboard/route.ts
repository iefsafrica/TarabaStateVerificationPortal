import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Document Stats
    const totalDocs = await prisma.document.count();
    const verifiedDocs = await prisma.document.count({ where: { status: "Verified" } });
    const pendingDocs = await prisma.document.count({ where: { status: "Pending" } });
    const rejectedDocs = await prisma.document.count({ where: { status: "Rejected" } });

    // Recent Employees (limit 5)
    const recentEmployees = await prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Pending Employees (limit 5)
    const pendingEmployees = await prisma.employee.findMany({
      where: { status: "Pending" },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        documents: {
          total: totalDocs,
          verified: verifiedDocs,
          pending: pendingDocs,
          rejected: rejectedDocs,
        },
        recentEmployees,
        pendingEmployees,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
