import { NextRequest, NextResponse } from "next/server";
import { attendeeController } from "@/server/controllers/attendee.controller";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;

    const result = await attendeeController.handleDashboard(eventId);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load admin dashboard";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
