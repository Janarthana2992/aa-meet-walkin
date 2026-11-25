import { NextRequest, NextResponse } from "next/server";
import { registrationController } from "@/server/controllers/registration.controller";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventIdParam = searchParams.get("eventId");
  const batchParam = searchParams.get("graduatingYear");

  const result = await registrationController.handleListRegistrations({
    eventId:
      eventIdParam && eventIdParam !== "all"
        ? Number(eventIdParam) || undefined
        : undefined,
    graduatingYear:
      batchParam && batchParam !== "All"
        ? Number(batchParam) || undefined
        : undefined,
    stream: searchParams.get("stream") || undefined,
    registrationSource: searchParams.get("registrationSource") || undefined,
    paymentMode: searchParams.get("paymentMode") || undefined,
    search: searchParams.get("search") || undefined,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
