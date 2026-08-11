import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userRef = searchParams.get("userRef");
  const slug = searchParams.get("slug");

  if (!userRef || !slug) {
    return NextResponse.json({ error: "Missing userRef or slug" }, { status: 400 });
  }

  const secretKey = process.env.NETAPPS_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing NETAPPS_SECRET_KEY");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://kyc-api.netapps.ng/api/v1/user/kyc?userRef=${userRef}&slug=${slug}`, {
      headers: {
        "x-secret-key": secretKey,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("NetApps API Error:", text);
      return NextResponse.json({ error: "Failed to fetch KYC data" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch KYC from NetApps:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
