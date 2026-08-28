import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "All";
    const period = searchParams.get("period") || "All Time";

    let whereClause: any = {};

    // 1. Filter by Status
    if (status !== "All") {
      whereClause.status = status;
    }

    // 2. Filter by Period (using joinDate or updatedAt based on status)
    if (period !== "All Time") {
      const now = new Date();
      let startDate = new Date();

      if (period === "Today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "This Week") {
        // Start of current week (Sunday as start)
        const day = now.getDay();
        const diff = now.getDate() - day;
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "This Month") {
        // Start of current month
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      // Use updatedAt to filter when they were verified/approved, or createdAt if pending
      whereClause.updatedAt = {
        gte: startDate,
        lte: now,
      };
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("Error exporting employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export employees" },
      { status: 500 }
    );
  }
}
