"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Event, EventRegistration } from "@/types/database.types";
import {
  AppHeader,
  Badge,
  Button,
  Card,
  Notice,
  Page,
  Spinner,
  Tabs,
  api,
  formatDate,
} from "@/components/ui";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { EventOverview } from "@/components/admin/EventOverview";
import { EventForm } from "@/components/admin/EventForm";
import { FeeEditor } from "@/components/admin/FeeEditor";
import { CsvUpload } from "@/components/admin/CsvUpload";
import { EditRegistrationSheet } from "@/components/admin/EditRegistrationSheet";
import { PeopleList } from "@/components/PeopleList";

type Tab = "overview" | "people" | "attendees" | "fees" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "people", label: "People" },
  { id: "attendees", label: "Attendees" },
  { id: "fees", label: "Fees" },
  { id: "settings", label: "Settings" },
];

function PublishBar({
  event,
  publishedOther,
  onChange,
}: {
  event: Event;
  publishedOther: Event | null;
  onChange: (ev: Event) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPublished = async (publish: boolean) => {
    if (
      publish &&
      publishedOther &&
      !confirm(`"${publishedOther.event_name}" is published now. Publishing this event will unpublish it. Continue?`)
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ data: Event }>(`/api/admin/events/${event.event_id}`, {
        method: "PATCH",
        json: { isActive: publish },
      });
      onChange(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {event.is_active ? <Badge tone="green">Published</Badge> : <Badge tone="amber">Draft</Badge>}
          <p className="mt-1 text-sm text-stone-600">
            {event.is_active
              ? "Open for check-in. Desk volunteers see this event."
              : "Not visible to attendees or volunteers."}
          </p>
        </div>
        {event.is_active ? (
          <Button size="sm" variant="secondary" onClick={() => setPublished(false)} loading={busy}>
            Unpublish
          </Button>
        ) : (
          <Button size="sm" onClick={() => setPublished(true)} loading={busy}>
            Publish
          </Button>
        )}
      </div>
      {error && <Notice tone="error" className="mt-3">{error}</Notice>}
    </div>
  );
}

export default function EventWorkspacePage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = Number(params.eventId);

  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState<EventRegistration | null>(null);
  const [peopleKey, setPeopleKey] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState<number | null>(null);

  const load = useCallback(() => {
    api<{ data: Event[] }>("/api/admin/events")
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  const loadAttendeeCount = useCallback(() => {
    api<{ totalCount: number }>(`/api/admin/events/${eventId}/pre-registrations`)
      .then((res) => setAttendeeCount(res.totalCount))
      .catch(() => setAttendeeCount(null));
  }, [eventId]);

  useEffect(() => {
    if (tab === "attendees") loadAttendeeCount();
  }, [tab, loadAttendeeCount]);

  const event = events?.find((e) => e.event_id === eventId) || null;
  const publishedOther = events?.find((e) => e.is_active && e.event_id !== eventId) || null;

  const replaceEvent = (updated: Event) =>
    setEvents((list) =>
      (list || []).map((e) =>
        e.event_id === updated.event_id ? updated : updated.is_active ? { ...e, is_active: false } : e
      )
    );

  const deleteEvent = async () => {
    if (!event) return;
    const typed = prompt(
      `Deleting "${event.event_name}" also deletes its check-ins, attendee list and fees. This cannot be undone.\n\nType DELETE to confirm.`
    );
    if (typed !== "DELETE") return;
    try {
      await api(`/api/admin/events/${event.event_id}`, { method: "DELETE" });
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the event.");
    }
  };

  const back = { href: "/admin", label: "Back to events" };

  if (!events && !error) {
    return (
      <>
        <AppHeader title="Event" back={back} wide />
        <Spinner />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <AppHeader title="Event" back={back} wide />
        <Page wide>
          <Notice tone="error">{error || "This event does not exist or was deleted."}</Notice>
        </Page>
      </>
    );
  }

  return (
    <>
      <AppHeader
        wide
        back={back}
        title={event.event_name}
        subtitle={[formatDate(event.event_date), event.venue].filter(Boolean).join(" · ")}
        right={<SignOutButton />}
      />
      <Tabs wide tabs={TABS} value={tab} onChange={setTab} />

      <Page wide>
        <PublishBar event={event} publishedOther={publishedOther} onChange={replaceEvent} />

        {tab === "overview" && <EventOverview eventId={event.event_id} />}

        {tab === "people" && (
          <PeopleList
            eventId={event.event_id}
            onSelect={setEditing}
            reloadKey={peopleKey}
            allowCheckIn={event.is_active}
          />
        )}

        {tab === "attendees" && (
          <Card title="Attendee list">
            <p className="text-sm text-stone-600">
              Upload the <span className="font-medium text-stone-800">event attendees</span> CSV exported
              from the association website. Uploading again updates existing rows and adds new ones.
              People are matched to the members list by email or mobile.
            </p>
            <p className="mt-3 text-sm text-stone-800">
              {attendeeCount === null ? "" : `${attendeeCount} people on the list.`}
            </p>
            <div className="mt-3">
              <CsvUpload
                endpoint={`/api/admin/events/${event.event_id}/pre-registrations`}
                buttonLabel="Upload attendees CSV"
                onDone={() => {
                  loadAttendeeCount();
                  setPeopleKey((k) => k + 1);
                }}
              />
            </div>
          </Card>
        )}

        {tab === "fees" && <FeeEditor eventId={event.event_id} />}

        {tab === "settings" && (
          <>
            <Card title="Event details">
              <EventForm event={event} submitLabel="Save changes" onSaved={replaceEvent} />
            </Card>
            <Card title="Delete event">
              <p className="text-sm text-stone-600 mb-3">
                Removes the event with all its check-ins, attendee list and fees. Download the check-ins
                first if you need a record.
              </p>
              <Button variant="danger" onClick={deleteEvent}>
                Delete event
              </Button>
            </Card>
          </>
        )}
      </Page>

      <EditRegistrationSheet
        registration={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          setPeopleKey((k) => k + 1);
        }}
      />
    </>
  );
}
