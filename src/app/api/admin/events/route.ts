import { NextRequest, NextResponse } from "next/server";
import { eventController } from "@/server/controllers/event.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await eventController.handleListEvents();
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch events";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await eventController.handleCreateEvent(body);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
