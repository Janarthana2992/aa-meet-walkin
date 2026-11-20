import { NextRequest, NextResponse } from "next/server";
import { attendeeController } from "@/server/controllers/attendee.controller";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const batchYear = searchParams.get("batchYear") || undefined;
    const stream = searchParams.get("stream") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const checkedIn = searchParams.get("checkedIn") || undefined;
    const eventId = searchParams.get("eventId") || undefined;

    const result = await attendeeController.handleSearch({
      search,
      batchYear,
      stream,
      paymentStatus,
      checkedIn,
      eventId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to search attendees";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
