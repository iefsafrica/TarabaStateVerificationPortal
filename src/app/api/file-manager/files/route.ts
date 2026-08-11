import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    if (!file || !folderId) {
      return NextResponse.json(
        { success: false, error: "Missing file or folderId" },
        { status: 400 }
      );
    }

    if (!prisma.systemFile) {
       return NextResponse.json(
        { success: false, error: "Prisma systemFile client not ready" },
        { status: 500 }
      );
    }

    const name = file.name;
    const size = file.size;
    const type = name.split('.').pop() || "unknown";

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename to avoid overwrites
    const uniqueFilename = `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    const fileUrl = `/uploads/${uniqueFilename}`;

    // Read the file and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const newFile = await prisma.systemFile.create({
      data: {
        name,
        size,
        type,
        folderId,
        url: fileUrl
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
