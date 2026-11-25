import { NextRequest, NextResponse } from "next/server";
import { registrationController } from "@/server/controllers/registration.controller";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventIdParam = searchParams.get("eventId");
  const eventId =
    eventIdParam && eventIdParam !== "all" ? Number(eventIdParam) : undefined;

  const result = await registrationController.handleDashboardAnalytics(
    eventId && !isNaN(eventId) ? eventId : undefined
  );

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
