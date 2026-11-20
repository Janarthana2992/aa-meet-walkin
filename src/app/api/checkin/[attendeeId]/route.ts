import { NextRequest, NextResponse } from "next/server";
import { attendeeController } from "@/server/controllers/attendee.controller";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attendeeId: string }> }
) {
  try {
    const { attendeeId } = await context.params;
    const body = await req.json();

    const result = await attendeeController.handleCheckIn(attendeeId, body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to process check-in";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
