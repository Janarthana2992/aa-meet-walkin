import { NextRequest, NextResponse } from "next/server";
import { registrationController } from "@/server/controllers/registration.controller";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await context.params;
    const numericId = Number(registrationId);
    if (!numericId || isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid registration ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = await registrationController.handleUpdateRegistration(
      numericId,
      body
    );
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update registration";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await context.params;
    const numericId = Number(registrationId);
    if (!numericId || isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid registration ID" },
        { status: 400 }
      );
    }

    const result = await registrationController.handleDeleteRegistration(
      numericId
    );
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete registration";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
