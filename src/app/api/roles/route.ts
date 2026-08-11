import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const roles = await (prisma.role ? prisma.role.findMany({
      orderBy: { createdAt: "desc" }
    }) : []);

    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    console.error("Fetch roles error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Role name is required" },
        { status: 400 }
      );
    }

    if (!prisma.role) {
       return NextResponse.json(
        { success: false, error: "Prisma role client not ready" },
        { status: 500 }
      );
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: "Role with this name already exists" },
        { status: 400 }
      );
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissions || [],
      },
    });

    if (prisma.activity) {
      await prisma.activity.create({
        data: {
          title: `New role created: ${name}`,
          type: "System",
          status: "Success",
        }
      });
    }

    return NextResponse.json({ success: true, data: newRole });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create role" },
      { status: 500 }
    );
  }
}
