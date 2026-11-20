import { NextResponse } from "next/server";
import { eventController } from "@/server/controllers/event.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await eventController.handleGetActiveEvent();
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
