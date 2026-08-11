import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    const whereClause: any = {};
    if (parentId !== null) {
      whereClause.parentId = parentId === "root" ? null : parentId;
    }

    const folders = await (prisma.folder ? prisma.folder.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        parent: { select: { name: true } },
      }
    }) : []);

    return NextResponse.json({ success: true, data: folders });
  } catch (error) {
    console.error("Fetch folders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, scope, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Folder name is required" },
        { status: 400 }
      );
    }

    if (!prisma.folder) {
       return NextResponse.json(
        { success: false, error: "Prisma folder client not ready" },
        { status: 500 }
      );
    }

    const newFolder = await prisma.folder.create({
      data: {
        name,
        scope: scope || "Global",
        parentId: parentId || null,
      },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `Folder created: ${name}`,
          type: "SystemFile",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true, data: newFolder });
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
