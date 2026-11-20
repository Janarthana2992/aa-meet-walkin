import { NextRequest, NextResponse } from "next/server";
import { attendeeRepository } from "@/server/repositories/attendee.repository";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ attendeeId: string }> }
) {
  try {
    const { attendeeId } = await context.params;
    const body = await req.json();

    const updated = await attendeeRepository.updateAttendee(attendeeId, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Attendee not found or failed to update" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Attendee updated successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update attendee";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ attendeeId: string }> }
) {
  try {
    const { attendeeId } = await context.params;
    const success = await attendeeRepository.deleteAttendee(attendeeId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete attendee" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendee deleted successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete attendee";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
