import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const totalFiles = await (prisma.systemFile ? prisma.systemFile.count() : 0);
    const totalFolders = await (prisma.folder ? prisma.folder.count() : 0);
    const rootFolders = await (prisma.folder ? prisma.folder.count({ where: { parentId: null } }) : 0);
    const nestedFolders = await (prisma.folder ? prisma.folder.count({ where: { parentId: { not: null } } }) : 0);
    
    // Calculate storage used (mocked as sum of sizes)
    const files = await (prisma.systemFile ? prisma.systemFile.findMany({ select: { size: true } }) : []);
    const storageUsedBytes = files.reduce((acc: any, curr: any) => acc + curr.size, 0);

    const recentActivities = await (prisma.activity ? prisma.activity.findMany({
      where: { type: "SystemFile" },
      take: 5,
      orderBy: { createdAt: "desc" },
    }) : []);

    return NextResponse.json({
      success: true,
      data: {
        totalFiles,
        totalFolders,
        rootFolders,
        nestedFolders,
        storageUsedBytes,
        recentActivities
      }
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch file manager dashboard data" },
      { status: 500 }
    );
  }
}
