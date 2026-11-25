"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  UserPlus,
  Loader2,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  Event,
  EventPreRegistration,
  EventRegistration,
} from "@/types/database.types";

export default function DeskCheckInDirectoryPage() {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedInList, setCheckedInList] = useState<EventRegistration[]>([]);
  const [pendingPreRegList, setPendingPreRegList] = useState<
    EventPreRegistration[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadDeskData = useCallback(async () => {
    setLoading(true);
    try {
      const evRes = await fetch("/api/events/active");
      const evJson = await evRes.json();
      const ev: Event | null = evJson.data || null;
      setActiveEvent(ev);

      if (!ev) {
        setCheckedInList([]);
        setPendingPreRegList([]);
        return;
      }

      const q = searchQuery.trim();
      const regParams = new URLSearchParams({ eventId: String(ev.event_id) });
      if (q) regParams.append("search", q);

      const preParams = new URLSearchParams();
      if (q) preParams.append("search", q);

      const [regRes, preRes] = await Promise.all([
        fetch(`/api/admin/registrations?${regParams.toString()}`),
        fetch(
          `/api/admin/events/${ev.event_id}/pre-registrations?${preParams.toString()}`
        ),
      ]);

      const regJson = regRes.ok ? await regRes.json() : { data: [] };
      const preJson = preRes.ok ? await preRes.json() : { data: [] };

      const regs: EventRegistration[] = regJson.data || [];
      const preRegs: EventPreRegistration[] = preJson.data || [];

      const checkedEmails = new Set(regs.map((r) => r.email.toLowerCase()));
      setCheckedInList(regs);
      setPendingPreRegList(
        preRegs.filter((p) => !checkedEmails.has(p.email.toLowerCase()))
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadDeskData();
  }, [loadDeskData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-teal-700" />
              <span>Home</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-teal-200 bg-white p-0.5 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="IRTTAA Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-teal-950">
                  Volunteer Desk Directory
                </h1>
                <p className="text-xs text-teal-700/80 font-medium">
                  {activeEvent
                    ? activeEvent.event_name
                    : "No active event selected"}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/register"
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Venue Check-In</span>
          </Link>
        </div>

        {/* Search Box */}
        <div className="p-5 rounded-3xl bg-white border border-teal-200 shadow-lg shadow-teal-950/5">
          <div className="relative">
            <Search className="w-5 h-5 text-teal-600 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search checked-in passes or awaiting pre-registrations by Name, Email, Mobile, or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-teal-200 text-sm font-semibold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Awaiting Check-In (Pre-Registered) */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/80 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-teal-950 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Awaiting Check-In ({pendingPreRegList.length})</span>
                </h2>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {pendingPreRegList.length === 0 ? (
                  <p className="text-xs text-teal-700/70 py-8 text-center">
                    No pending pre-registrations match your search.
                  </p>
                ) : (
                  pendingPreRegList.map((pre) => (
                    <div
                      key={pre.pre_registration_id}
                      className="p-4 rounded-2xl border border-teal-100 bg-teal-50/30 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-teal-950">
                          {pre.full_name}
                        </div>
                        <div className="text-xs text-teal-700/80">
                          {pre.graduating_year || "—"} • {pre.stream || "—"}
                        </div>
                        <div className="text-[11px] font-mono text-teal-600 mt-0.5">
                          {pre.mobile || pre.email}
                        </div>
                      </div>

                      <Link
                        href={`/register?q=${encodeURIComponent(pre.email)}`}
                        className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                      >
                        <span>Check In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Already Checked In */}
            <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-teal-950 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Checked In ({checkedInList.length})</span>
                </h2>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {checkedInList.length === 0 ? (
                  <p className="text-xs text-teal-700/70 py-8 text-center">
                    No alumni have checked in yet.
                  </p>
                ) : (
                  checkedInList.map((reg) => (
                    <div
                      key={reg.registration_id}
                      className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-teal-950">
                          {reg.full_name}
                        </div>
                        <div className="text-xs text-teal-700/80">
                          {reg.graduating_year || "—"} • {reg.stream || "—"} •{" "}
                          <span className="font-bold text-emerald-700">
                            ₹{Number(reg.total_amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-teal-600 mt-0.5">
                          Pass #IRTTAA-{String(reg.registration_id).padStart(4, "0")}
                          {reg.utr_last4 ? ` • UTR: ${reg.utr_last4}` : ""}
                        </div>
                      </div>

                      <Link
                        href={`/register?q=${encodeURIComponent(reg.email)}`}
                        className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold shrink-0"
                      >
                        View Pass
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
