import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "File name is required" }, { status: 400 });
    }

    if (!prisma.systemFile) {
       return NextResponse.json({ success: false, error: "Prisma systemFile client not ready" }, { status: 500 });
    }

    const updatedFile = await prisma.systemFile.update({
      where: { id: params.id },
      data: { name },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `File renamed to: ${name}`,
          type: "SystemFile",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true, data: updatedFile });
  } catch (error) {
    console.error("Update file error:", error);
    return NextResponse.json({ success: false, error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma.systemFile) {
       return NextResponse.json({ success: false, error: "Prisma systemFile client not ready" }, { status: 500 });
    }

    await prisma.systemFile.delete({
      where: { id: params.id },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `File deleted`,
          type: "SystemFile",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete file" }, { status: 500 });
  }
}
