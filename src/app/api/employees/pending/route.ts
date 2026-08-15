import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE() {
  try {
    const result = await prisma.employee.deleteMany({
      where: {
        status: "Pending",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully cleared ${result.count} pending employees.`,
      count: result.count 
    });
  } catch (error) {
    console.error("Error clearing pending employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear pending employees" },
      { status: 500 }
    );
  }
}
