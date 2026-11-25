import { NextRequest, NextResponse } from "next/server";
import { registrationController } from "@/server/controllers/registration.controller";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await registrationController.handleVenueLookup(body);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to look up alumni record";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
