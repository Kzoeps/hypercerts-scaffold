import sdk from "@/lib/hypercerts-sdk";
import { config } from "@/lib/config";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  try {
    const session = await sdk.callback(searchParams);
    const cookieStore = await cookies();
    cookieStore.set("user-did", session.did, {
      httpOnly: true,
      secure: config.isProduction,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // The return_to parameter can be set by the login flow to preserve user's location
    const returnTo = searchParams.get("return_to") || "/";

    // Validate returnTo is a relative path (security: prevent open redirect)
    const redirectPath = returnTo.startsWith("/") ? returnTo : "/";

    return NextResponse.redirect(new URL(redirectPath, config.baseUrl));
  } catch (e) {
    console.error("Authentication failed:", e);
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
