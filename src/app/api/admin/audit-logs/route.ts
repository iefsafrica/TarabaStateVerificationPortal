import { NextResponse } from "next/server";

export async function GET() {
  // In a real implementation, you would fetch this from your database
  // e.g., using Prisma: const logs = await prisma.activity.findMany({...})
  
  const mockAuditLogs = [
    {
      id: "LOG-001",
      action: "Created User",
      user: "Super Admin",
      details: "Created a new user with role 'Verifier'",
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: "Success",
      type: "User Management"
    },
    {
      id: "LOG-002",
      action: "Updated Permissions",
      user: "Super Admin",
      details: "Modified permissions for 'Verifier' role",
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      status: "Success",
      type: "System Configuration"
    },
    {
      id: "LOG-003",
      action: "Failed Login Attempt",
      user: "Unknown",
      details: "Failed login attempt from IP 192.168.1.10",
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      status: "Warning",
      type: "Security"
    },
    {
      id: "LOG-004",
      action: "Exported Data",
      user: "John Doe",
      details: "Exported Employee list to CSV",
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      status: "Success",
      type: "Data Export"
    }
  ];

  return NextResponse.json({ logs: mockAuditLogs });
}
