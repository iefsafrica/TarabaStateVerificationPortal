import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Process dates safely
    const updateData = { ...data };
    if (updateData.birthdate) updateData.birthdate = new Date(updateData.birthdate);
    if (updateData.dateOfFirstAppointment) updateData.dateOfFirstAppointment = new Date(updateData.dateOfFirstAppointment);
    
    // Don't accidentally override ID
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    // If status was updated to Active, log an approval activity
    if (updateData.status === "Active") {
      await prisma.activity.create({
        data: {
          title: "Employee Approved",
          description: `${employee.firstName} ${employee.lastName}'s account was approved and is now active.`,
          type: "Employee",
          status: "Success",
        },
      });
    } else if (Object.keys(updateData).length > 0) {
       await prisma.activity.create({
        data: {
          title: "Employee Profile Updated",
          description: `${employee.firstName} ${employee.lastName}'s profile was updated.`,
          type: "Employee",
          status: "Success",
        },
      });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
