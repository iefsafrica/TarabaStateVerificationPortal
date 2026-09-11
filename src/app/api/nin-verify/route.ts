import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * NetApps White-Label API — NIN Verification
 *
 * POST /api/nin-verify
 * Body: { nin: string, employeeId?: string }
 *
 * Performs a direct server-to-server call to the NetApps KYC API using the
 * secret key (never exposed to the browser). Returns the verified identity
 * payload and optionally updates an existing employee record in the DB.
 *
 * Requires White-Label API access to be activated on your NetApps account.
 * Contact: support@netapps.ng
 */

const NETAPPS_BASE_URL = "https://kyc-api.netapps.ng/api/v1/kyc";

interface NetAppsNINResponse {
  error?: boolean;       // true on failure
  status?: boolean;
  success?: boolean;
  message?: string;
  kycType?: string;
  data?: {
    nin?: string;
    NIN?: string;
    firstname?: string;
    firstName?: string;
    middlename?: string;
    middleName?: string;
    surname?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    dob?: string;
    birthdate?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    photo?: string;
    address?: string;
    state?: string;
    lga?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nin, employeeId } = body as { nin?: string; employeeId?: string };

    // --- Input validation ---
    if (!nin || typeof nin !== "string") {
      return NextResponse.json(
        { success: false, error: "NIN is required" },
        { status: 400 }
      );
    }

    const cleanNin = nin.trim();
    if (!/^\d{11}$/.test(cleanNin)) {
      return NextResponse.json(
        { success: false, error: "NIN must be exactly 11 digits" },
        { status: 400 }
      );
    }

    // --- Secret key check ---
    const secretKey = process.env.NETAPPS_SECRET_KEY;
    if (!secretKey) {
      console.error("[NIN-Verify] Missing NETAPPS_SECRET_KEY in environment");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // --- Call NetApps White-Label API ---
    console.log(`[NIN-Verify] Verifying NIN: ${cleanNin.slice(0, 4)}****${cleanNin.slice(-2)}`);

    const netappsRes = await fetch(`${NETAPPS_BASE_URL}/nin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": secretKey,
      },
      body: JSON.stringify({ nin: cleanNin }),
    });

    const rawText = await netappsRes.text();
    let netappsData: NetAppsNINResponse;

    try {
      netappsData = JSON.parse(rawText);
    } catch {
      console.error("[NIN-Verify] Non-JSON response from NetApps:", rawText.slice(0, 200));
      return NextResponse.json(
        { success: false, error: "Unexpected response from verification provider" },
        { status: 502 }
      );
    }

    // --- Handle NetApps error responses ---
    // NetApps returns { error: true, message: "..." } on failure
    const isFailure =
      !netappsRes.ok ||
      netappsData.error === true ||
      netappsData.status === false ||
      netappsData.success === false;

    if (isFailure) {
      const reason =
        netappsData.message ||
        (netappsData.data as any)?.message ||
        "NIN could not be verified";

      console.warn("[NIN-Verify] NetApps rejected NIN:", reason);

      // Log failed attempt as an activity
      try {
        await prisma.activity.create({
          data: {
            title: "NIN Verification Failed",
            description: `NIN verification attempt failed: ${reason}`,
            type: "Employee",
            status: "Failed",
          },
        });
      } catch {}

      return NextResponse.json(
        { success: false, error: reason },
        { status: 422 }
      );
    }

    // --- Normalise the identity payload ---
    const raw = netappsData.data || netappsData;

    const identity = {
      nin: (raw.nin || raw.NIN || cleanNin) as string,
      firstName: (raw.firstName || raw.firstname || "") as string,
      middleName: (raw.middleName || raw.middlename || "") as string,
      lastName: (raw.lastName || raw.surname || "") as string,
      gender: (raw.gender || "") as string,
      birthdate: (raw.dateOfBirth || raw.dob || raw.birthdate || "") as string,
      phone: (raw.mobile || raw.phone || "") as string,
      email: (raw.email || "") as string,
      photo: (raw.photo || "") as string,
      address: (raw.address || "") as string,
      state: (raw.state || "") as string,
      lga: (raw.lga || "") as string,
    };

    // --- Optionally update an existing employee record ---
    if (employeeId) {
      try {
        await prisma.employee.update({
          where: { id: employeeId },
          data: {
            ninVerified: true,
            ninData: netappsData as any,
            // Only fill fields that are currently empty
            ...(identity.firstName && { firstName: identity.firstName }),
            ...(identity.lastName && { lastName: identity.lastName }),
            ...(identity.middleName && { middleName: identity.middleName }),
            ...(identity.gender && { gender: identity.gender }),
            ...(identity.birthdate && { birthdate: new Date(identity.birthdate) }),
            ...(identity.phone && { telephone: identity.phone }),
          },
        });
        console.log(`[NIN-Verify] Updated employee ${employeeId} with verified NIN data`);
      } catch (dbErr) {
        // Non-fatal — still return the verification result even if DB update fails
        console.error("[NIN-Verify] Failed to update employee record:", dbErr);
      }
    }

    // --- Log successful verification ---
    await prisma.activity.create({
      data: {
        title: "NIN Verified",
        description: `NIN ending in ...${cleanNin.slice(-4)} successfully verified via White-Label API.`,
        type: "Employee",
        status: "Success",
      },
    });

    console.log("[NIN-Verify] Verification successful");

    return NextResponse.json({
      success: true,
      data: identity,
      raw: netappsData, // Full raw response stored as ninData in DB
    });
  } catch (error: any) {
    console.error("[NIN-Verify] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during NIN verification" },
      { status: 500 }
    );
  }
}
