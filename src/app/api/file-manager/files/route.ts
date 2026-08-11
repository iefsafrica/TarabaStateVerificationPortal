import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    const whereClause: any = {};
    if (folderId && folderId !== "all") {
      whereClause.folderId = folderId;
    }

    const files = await (prisma.systemFile ? prisma.systemFile.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        folder: { select: { name: true } }
      }
    }) : []);

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error("Fetch files error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, size, type, folderId } = body;

    if (!name || !size || !type || !folderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!prisma.systemFile) {
       return NextResponse.json(
        { success: false, error: "Prisma systemFile client not ready" },
        { status: 500 }
      );
    }

    // Since we don't have a real cloud storage bucket wired up right now, we'll mock the URL
    const mockUrl = `/uploads/${name.replace(/\s+/g, '-').toLowerCase()}`;

    const newFile = await prisma.systemFile.create({
      data: {
        name,
        size,
        type,
        folderId,
        url: mockUrl
      },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `File uploaded: ${name}`,
          type: "SystemFile",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true, data: newFile });
  } catch (error) {
    console.error("Create file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
