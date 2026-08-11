import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Document Stats (with safety checks for schema cache)
    const totalDocs = prisma.document ? await prisma.document.count() : 0;
    const verifiedDocs = prisma.document ? await prisma.document.count({ where: { status: "Verified" } }) : 0;
    const pendingDocs = prisma.document ? await prisma.document.count({ where: { status: "Pending" } }) : 0;
    const rejectedDocs = prisma.document ? await prisma.document.count({ where: { status: "Rejected" } }) : 0;

    // Recent Employees (limit 5)
    const recentEmployees = prisma.employee ? await prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }) : [];

    // Pending Employees (limit 5)
    const pendingEmployees = prisma.employee ? await prisma.employee.findMany({
      where: { status: "Pending" },
      take: 5,
      orderBy: { createdAt: "desc" },
    }) : [];

    // Recent Activities (limit 5)
    const recentActivities = prisma.activity ? await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }) : [];

    // Pending Activities (limit 5)
    const pendingActivities = prisma.activity ? await prisma.activity.findMany({
      where: { status: "Pending" },
      take: 5,
      orderBy: { createdAt: "desc" },
    }) : [];

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
        recentActivities,
        pendingActivities,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics: " + (error as Error).message },
      { status: 500 }
    );
  }
}
