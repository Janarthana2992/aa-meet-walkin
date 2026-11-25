import { NextRequest } from "next/server";
import { SESSION_COOKIE, SessionPayload, verifySession } from "./session";
import { eventService } from "../services/event.service";

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
}

/**
 * Desk volunteers may only read the published event. Returns an error
 * message when the request is not allowed, otherwise null.
 */
export async function deskEventGuard(req: NextRequest, eventId: number | undefined): Promise<string | null> {
  const session = await getSession(req);
  if (session?.role !== "desk") return null;
  const active = await eventService.getActiveEvent();
  if (!active || !eventId || eventId !== active.event_id) {
    return "Desk volunteers can only view the published event.";
  }
  return null;
}
