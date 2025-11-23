import { NextResponse } from "next/server";
import { clearCachedActivity } from "~/lib/cache/activity-cache";
import { env } from "~/env";

export async function POST(request: Request) {
  // Only allow in development
  if (env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as { owner: string; name: string };

    await clearCachedActivity(body.owner, body.name);

    return NextResponse.json({
      success: true,
      message: `Cache cleared for ${body.owner}/${body.name}`,
    });
  } catch (error) {
    console.error("[Cache Clear] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cache" },
      { status: 500 },
    );
  }
}
