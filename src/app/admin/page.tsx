"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Event } from "@/types/database.types";
import {
  AppHeader,
  Badge,
  Empty,
  LinkButton,
  Notice,
  Page,
  PageTitle,
  Spinner,
  api,
  formatDate,
} from "@/components/ui";
import { SignOutButton } from "@/components/admin/SignOutButton";

function EventRow({ ev }: { ev: Event }) {
  const past = ev.event_date < new Date().toISOString().slice(0, 10);
  return (
    <li>
      <Link
        href={`/admin/events/${ev.event_id}`}
        className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-900 truncate">{ev.event_name}</span>
            {ev.is_active ? (
              <Badge tone="green">Published</Badge>
            ) : past ? (
              <Badge>Finished</Badge>
            ) : (
              <Badge tone="amber">Draft</Badge>
            )}
          </div>
          <div className="text-sm text-stone-500 truncate">
            {formatDate(ev.event_date)}
            {ev.venue ? ` · ${ev.venue}` : ""}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
      </Link>
    </li>
  );
}

function Section({ title, events }: { title: string; events: Event[] }) {
  if (events.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-medium text-stone-500 mb-2">{title}</h2>
      <ul className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-200 overflow-hidden">
        {events.map((ev) => (
          <EventRow key={ev.event_id} ev={ev} />
        ))}
      </ul>
    </section>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ data: Event[] }>("/api/admin/events")
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const published = (events || []).filter((e) => e.is_active);
  const upcoming = (events || [])
    .filter((e) => !e.is_active && e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = (events || []).filter((e) => !e.is_active && e.event_date < today);

  return (
    <>
      <AppHeader title="IRTTAA Events" subtitle="Organizer" right={<SignOutButton />} />
      <Page>
        <PageTitle
          description="Open an event to see its check-ins, upload the attendee list, set fees and publish it."
          action={
            <LinkButton href="/admin/events/new" size="sm" className="shrink-0">
              <Plus className="w-4 h-4" /> New event
            </LinkButton>
          }
        >
          Events
        </PageTitle>

        {error && <Notice tone="error">{error}</Notice>}
        {!events && !error ? (
          <Spinner />
        ) : events && events.length === 0 ? (
          <div className="bg-white rounded-lg border border-stone-200">
            <Empty>
              No events yet.
              <div className="mt-3">
                <LinkButton href="/admin/events/new" size="sm">
                  Create the first event
                </LinkButton>
              </div>
            </Empty>
          </div>
        ) : (
          <div className="space-y-5">
            <Section title="Published" events={published} />
            <Section title="Upcoming" events={upcoming} />
            <Section title="Past" events={past} />
          </div>
        )}

        <section className="pt-2">
          <h2 className="text-sm font-medium text-stone-500 mb-2">Association</h2>
          <ul className="bg-white rounded-lg border border-stone-200">
            <li>
              <Link href="/admin/members" className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-stone-900">Members list</div>
                  <div className="text-sm text-stone-500">
                    Used to recognise members at check-in. Shared by all events.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </Link>
            </li>
          </ul>
        </section>
      </Page>
    </>
  );
}
