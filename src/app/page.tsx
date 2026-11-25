"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event } from "@/types/database.types";
import { LinkButton, Spinner, formatDate } from "@/components/ui";

export default function HomePage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setEvent(json?.data || null))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-dvh flex flex-col max-w-md mx-auto px-5 py-6">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="" width={36} height={36} priority />
        <div className="text-sm leading-tight">
          <div className="font-semibold text-stone-900">IRTT Alumni Association</div>
          <div className="text-stone-500">Institute of Road and Transport Technology</div>
        </div>
      </div>

      <section className="flex-1 mt-10">
        {loading ? (
          <Spinner />
        ) : event ? (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 leading-snug">{event.event_name}</h1>
            <dl className="mt-4 space-y-1 text-stone-700">
              <div>{formatDate(event.event_date)}{event.event_time ? `, ${event.event_time}` : ""}</div>
              {event.venue && <div>{event.venue}</div>}
            </dl>
            {event.description && <p className="mt-4 text-stone-600">{event.description}</p>}

            <LinkButton href="/register" size="lg" className="w-full mt-8">
              Check in
            </LinkButton>
            <p className="mt-2 text-sm text-stone-500">
              You will need the email or mobile number you registered with.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-stone-900">No event open for check-in</h1>
            <p className="mt-2 text-stone-600">Check-in opens on the day of the event.</p>
          </>
        )}
      </section>

      <footer className="pt-10 text-sm">
        <Link href="/admin/login" className="text-stone-500 underline underline-offset-2 hover:text-stone-800">
          Staff sign in
        </Link>
      </footer>
    </main>
  );
}
