import { NextResponse } from "next/server";

export async function GET() {
  // In a real implementation, you would fetch this from a LoginLog table in your database
  
  const mockLoginLogs = [
    {
      id: "LL-001",
      user: "Super Admin",
      email: "admin@taraba.gov.ng",
      ipAddress: "192.168.1.45",
      device: "Windows 11, Chrome 114.0",
      date: new Date(new Date().getTime() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      status: "Successful"
    },
    {
      id: "LL-002",
      user: "Unknown",
      email: "info@tarabastate.gov",
      ipAddress: "10.0.0.12",
      device: "macOS, Safari",
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      status: "Failed"
    },
    {
      id: "LL-003",
      user: "Jane Smith",
      email: "jane.smith@taraba.gov.ng",
      ipAddress: "172.16.2.8",
      device: "Android, Chrome Mobile",
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      status: "Successful"
    },
    {
      id: "LL-004",
      user: "Unknown",
      email: "admin@taraba.gov.ng",
      ipAddress: "105.112.5.90",
      device: "Windows 10, Firefox",
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      status: "Failed"
    }
  ];

  return NextResponse.json({ logs: mockLoginLogs });
}
