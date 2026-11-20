import { NextRequest, NextResponse } from "next/server";
import { attendeeController } from "@/server/controllers/attendee.controller";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await attendeeController.handleWalkInRegistration(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
