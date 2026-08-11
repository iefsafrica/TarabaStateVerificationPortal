import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const permissions = await (prisma.permission ? prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { name: 'asc' }
      ]
    }) : []);

    return NextResponse.json({ success: true, data: permissions });
  } catch (error) {
    console.error("Fetch permissions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, label, module, description } = body;

    if (!name || !label || !module) {
      return NextResponse.json(
        { success: false, error: "Name, label, and module are required" },
        { status: 400 }
      );
    }

    if (!prisma.permission) {
       return NextResponse.json(
        { success: false, error: "Prisma permission client not ready" },
        { status: 500 }
      );
    }

    // Format name to be snake_case
    const formattedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    // Check if permission already exists
    const existingPerm = await prisma.permission.findUnique({
      where: { name: formattedName }
    });

    if (existingPerm) {
      return NextResponse.json(
        { success: false, error: "Permission with this name already exists" },
        { status: 400 }
      );
    }

    const newPermission = await prisma.permission.create({
      data: {
        name: formattedName,
        label,
        module,
        description
      },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `New permission added: ${label}`,
          type: "System",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true, data: newPermission });
  } catch (error) {
    console.error("Create permission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create permission" },
      { status: 500 }
    );
  }
}
