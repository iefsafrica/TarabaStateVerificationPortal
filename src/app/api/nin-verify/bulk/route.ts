import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * NetApps White-Label API — Bulk NIN Verification
 *
 * POST /api/nin-verify/bulk
 * Body: { employees: Array<{ employeeId: string; nin: string }> }
 *
 * Sequentially verifies a list of employee NINs using the NetApps
 * White-Label API, with a small delay between each call to respect rate limits.
 * Updates each employee's ninVerified + ninData in the database.
 *
 * Returns a summary: { verified: N, failed: N, errors: [...] }
 */

const NETAPPS_BASE_URL = "https://kyc-api.netapps.ng/api/v1";
const DELAY_BETWEEN_CALLS_MS = 400; // Respect NetApps rate limits

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface BulkItem {
  employeeId: string;
  nin: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employees } = body as { employees?: BulkItem[] };

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provide a non-empty employees array" },
        { status: 400 }
      );
    }

    if (employees.length > 100) {
      return NextResponse.json(
        { success: false, error: "Maximum 100 employees per bulk request" },
        { status: 400 }
      );
    }

    const secretKey = process.env.NETAPPS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const results = {
      verified: 0,
      failed: 0,
      errors: [] as { employeeId: string; nin: string; reason: string }[],
    };

    for (const item of employees) {
      const { employeeId, nin } = item;

      // Basic validation per item
      const cleanNin = (nin || "").trim();
      if (!employeeId || !/^\d{11}$/.test(cleanNin)) {
        results.failed++;
        results.errors.push({
          employeeId,
          nin: cleanNin,
          reason: "Invalid employeeId or NIN format",
        });
        continue;
      }

      try {
        const netappsRes = await fetch(`${NETAPPS_BASE_URL}/nin/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-secret-key": secretKey,
          },
          body: JSON.stringify({ nin: cleanNin, verify_type: "basic" }),
        });

        const netappsData = await netappsRes.json().catch(() => ({}));
        const success =
          netappsRes.ok &&
          netappsData.status !== false &&
          netappsData.success !== false;

        if (!success) {
          const reason =
            netappsData?.message ||
            netappsData?.data?.message ||
            `HTTP ${netappsRes.status}`;
          results.failed++;
          results.errors.push({ employeeId, nin: cleanNin, reason });
          console.warn(`[NIN-Bulk] Failed for employee ${employeeId}: ${reason}`);
        } else {
          const raw = netappsData.data || netappsData;

          await prisma.employee.update({
            where: { id: employeeId },
            data: {
              ninVerified: true,
              ninData: netappsData,
              ...(raw.firstname && { firstName: raw.firstname }),
              ...(raw.surname && { lastName: raw.surname }),
              ...(raw.middlename && { middleName: raw.middlename }),
              ...(raw.gender && { gender: raw.gender }),
              ...((raw.dateOfBirth || raw.dob) && {
                birthdate: new Date(raw.dateOfBirth || raw.dob),
              }),
            },
          });

          results.verified++;
          console.log(`[NIN-Bulk] Verified employee ${employeeId}`);
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          employeeId,
          nin: cleanNin,
          reason: err?.message || "Unexpected error",
        });
      }

      // Rate-limit guard between calls
      await sleep(DELAY_BETWEEN_CALLS_MS);
    }

    // Single audit log for the whole bulk run
    await prisma.activity.create({
      data: {
        title: "Bulk NIN Verification Completed",
        description: `Bulk run: ${results.verified} verified, ${results.failed} failed out of ${employees.length} employees.`,
        type: "Employee",
        status: results.failed === 0 ? "Success" : "Pending",
      },
    });

    return NextResponse.json({ success: true, summary: results });
  } catch (error: any) {
    console.error("[NIN-Bulk] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
