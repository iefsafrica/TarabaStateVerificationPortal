import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { name, scope } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Folder name is required" }, { status: 400 });
    }

    if (!prisma.folder) {
       return NextResponse.json({ success: false, error: "Prisma folder client not ready" }, { status: 500 });
    }

    const resolvedParams = await params;
    const updatedFolder = await prisma.folder.update({
      where: { id: resolvedParams.id },
      data: { name, scope },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `Folder renamed to: ${name}`,
          type: "SystemFile",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true, data: updatedFolder });
  } catch (error) {
    console.error("Update folder error:", error);
    return NextResponse.json({ success: false, error: "Failed to update folder" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!prisma.folder) {
       return NextResponse.json({ success: false, error: "Prisma folder client not ready" }, { status: 500 });
    }

    // Prisma onDelete: Cascade will handle deleting associated files if configured, 
    // but we can also manually delete files just in case
    const resolvedParams = await params;
    await prisma.folder.delete({
      where: { id: resolvedParams.id },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `Folder deleted`,
          type: "SystemFile",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete folder" }, { status: 500 });
  }
}
