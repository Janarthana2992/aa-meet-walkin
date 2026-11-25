import { NextRequest, NextResponse } from "next/server";
import { eventController } from "@/server/controllers/event.controller";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const numericId = Number(eventId);
  if (!numericId || isNaN(numericId)) {
    return NextResponse.json(
      { success: false, error: "Invalid event ID" },
      { status: 400 }
    );
  }
  const result = await eventController.handleGetFeeConfigs(numericId);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const numericId = Number(eventId);
    if (!numericId || isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const result = await eventController.handleUpdateFeeConfigs(
      numericId,
      body.rules || body
    );
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update fee rules";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
