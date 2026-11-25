"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  Loader2,
  AlertCircle,
  IndianRupee,
  Trash2,
  X,
  Clock,
} from "lucide-react";
import { Event, EventFeeConfiguration } from "@/types/database.types";
import {
  EVENT_TYPES,
  EventType,
  LATEST_BATCH_YEAR,
  MEMBERSHIP_DISPLAY_LABELS,
  REGISTRATION_MEMBERSHIP_TYPES,
} from "@/server/constants";

interface EventsManagerTabProps {
  events: Event[];
  onEventsUpdated: () => void;
  onFilterAnalytics: (eventId: number) => void;
}

export function EventsManagerTab({
  events,
  onEventsUpdated,
  onFilterAnalytics,
}: EventsManagerTabProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState<EventType>("CHAPTER_EVENT");
  const [chapterName, setChapterName] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("09:30 AM - 05:00 PM");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fee Config Modal State
  const [feeModalEvent, setFeeModalEvent] = useState<Event | null>(null);
  const [feeRules, setFeeRules] = useState<EventFeeConfiguration[]>([]);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [savingFees, setSavingFees] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: eventName.trim(),
          eventType,
          chapterName: chapterName.trim(),
          venue: venue.trim() || null,
          eventDate,
          eventTime: eventTime.trim() || null,
          description: description.trim() || null,
          isActive: true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create event");
      }
      setShowCreate(false);
      setEventName("");
      setChapterName("");
      setVenue("");
      setEventDate("");
      setDescription("");
      onEventsUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleSetActive = async (eventId: number) => {
    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    if (res.ok) onEventsUpdated();
  };

  const handleDelete = async (ev: Event) => {
    if (
      !confirm(
        `Delete "${ev.event_name}"? This also deletes its fee configs, pre-registrations, and venue check-ins.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/events/${ev.event_id}`, {
      method: "DELETE",
    });
    if (res.ok) onEventsUpdated();
  };

  const openFeeModal = async (ev: Event) => {
    setFeeModalEvent(ev);
    setFeeError(null);
    setLoadingFees(true);
    try {
      const res = await fetch(`/api/admin/events/${ev.event_id}/fees`);
      const json = await res.json();
      if (json.success) {
        setFeeRules(json.data || []);
      }
    } finally {
      setLoadingFees(false);
    }
  };

  const handleSaveFeeRules = async () => {
    if (!feeModalEvent) return;
    const badRange = feeRules.find(
      (r) => !r.min_graduating_year || !r.max_graduating_year || r.min_graduating_year > r.max_graduating_year
    );
    if (badRange) {
      setFeeError("Each rule needs a valid batch range (From must not be after To).");
      return;
    }
    setFeeError(null);
    setSavingFees(true);
    try {
      const payload = feeRules.map((r) => ({
        minGraduatingYear: r.min_graduating_year,
        maxGraduatingYear: r.max_graduating_year,
        membershipType: r.membership_type,
        registrationFee: Number(r.registration_fee) || 0,
        displayOrder: r.display_order || 0,
        isActive: r.is_active,
      }));
      const res = await fetch(
        `/api/admin/events/${feeModalEvent.event_id}/fees`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rules: payload }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setFeeModalEvent(null);
      } else {
        setFeeError(json.error || "Could not save fee rules. Please try again.");
      }
    } catch {
      setFeeError("Network error while saving fee rules.");
    } finally {
      setSavingFees(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-teal-950">
            Events & Fee Configuration
          </h3>
          <p className="text-xs text-teal-700/80 font-medium">
            Create chapter meets and manage batch-wise entry fee schedules.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {showCreate && (
        <div className="p-6 rounded-3xl bg-white border border-teal-200 shadow-lg">
          <h4 className="text-base font-bold text-teal-950 mb-4">
            Create New Alumni Meet
          </h4>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salem Chapter Meet 2026"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                  Event Type *
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 bg-white outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salem Chapter"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Estancia, Salem"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                  Event Time
                </label>
                <input
                  type="text"
                  placeholder="09:30 AM - 05:00 PM"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Welcome message or venue instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-100 text-[11px] text-teal-800 font-medium">
              Default batch fee tiers (1988–2000: ₹500, 2001–2010: ₹400, 2011–2020: ₹300, 2021 onwards: Free) will be automatically created and can be customized anytime.
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Publish Event</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="md:col-span-2 p-10 rounded-3xl bg-white border border-teal-100 text-center text-xs text-teal-700/70">
            No events created yet. Click <strong>Create New Event</strong> above to get started.
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.event_id}
              className="p-6 rounded-3xl bg-white border border-teal-100 shadow-lg shadow-teal-950/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900">
                      {ev.event_type.replace("_", " ")}
                    </span>
                    <span className="text-[11px] font-bold text-teal-700">
                      ID #{ev.event_id}
                    </span>
                  </div>
                  {ev.is_active && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active Event</span>
                    </span>
                  )}
                </div>

                <h4 className="text-xl font-black text-teal-950">{ev.event_name}</h4>
                <p className="text-xs text-teal-700 font-semibold mt-0.5">
                  {ev.chapter_name}
                </p>

                <div className="mt-3 space-y-1 text-xs text-teal-800/80 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{ev.event_date}</span>
                    {ev.event_time && (
                      <>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>{ev.event_time}</span>
                      </>
                    )}
                  </div>
                  {ev.venue && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{ev.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {!ev.is_active && (
                    <button
                      onClick={() => handleSetActive(ev.event_id)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => openFeeModal(ev)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 cursor-pointer"
                  >
                    <IndianRupee className="w-3 h-3" />
                    <span>Fee Rules</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFilterAnalytics(ev.event_id)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-950 cursor-pointer"
                  >
                    View Analytics →
                  </button>
                  <button
                    onClick={() => handleDelete(ev)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fee Configuration Modal */}
      {feeModalEvent && (
        <div className="fixed inset-0 z-50 bg-teal-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-teal-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-black text-teal-950">
                  Fee Rules — {feeModalEvent.event_name}
                </h4>
                <p className="text-xs text-teal-700/80">
                  Customize entry fees by batch range and membership classification.
                </p>
              </div>
              <button
                onClick={() => setFeeModalEvent(null)}
                className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingFees ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-teal-100 text-[11px] font-bold uppercase text-teal-800">
                      <tr>
                        <th className="py-2 pr-3">Membership Type</th>
                        <th className="py-2 pr-3">Batch Range</th>
                        <th className="py-2 pr-3">Fee (₹)</th>
                        <th className="py-2">Active</th>
                        <th className="py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-50">
                      {feeRules.map((rule, idx) => (
                        <tr key={rule.fee_configuration_id}>
                          <td className="py-2 pr-3">
                            <select
                              aria-label="Membership type"
                              value={rule.membership_type}
                              onChange={(e) => {
                                const updated = [...feeRules];
                                updated[idx] = {
                                  ...rule,
                                  membership_type: e.target
                                    .value as EventFeeConfiguration["membership_type"],
                                };
                                setFeeRules(updated);
                              }}
                              className="h-8 px-2 rounded-lg border border-teal-200 font-semibold text-teal-950 bg-white"
                            >
                              {REGISTRATION_MEMBERSHIP_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {MEMBERSHIP_DISPLAY_LABELS[t]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {(["min_graduating_year", "max_graduating_year"] as const).map(
                              (field, i) => (
                                <React.Fragment key={field}>
                                  {i === 1 && <span className="px-1 text-teal-700">–</span>}
                                  <input
                                    type="number"
                                    aria-label={i === 0 ? "From batch" : "To batch"}
                                    value={rule[field]}
                                    onChange={(e) => {
                                      const updated = [...feeRules];
                                      updated[idx] = {
                                        ...rule,
                                        [field]: Number(e.target.value),
                                      };
                                      setFeeRules(updated);
                                    }}
                                    className="w-20 h-8 px-2 rounded-lg border border-teal-200 font-mono text-teal-950"
                                  />
                                </React.Fragment>
                              )
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              min={0}
                              value={rule.registration_fee}
                              onChange={(e) => {
                                const updated = [...feeRules];
                                updated[idx] = {
                                  ...rule,
                                  registration_fee: Number(e.target.value),
                                };
                                setFeeRules(updated);
                              }}
                              className="w-24 h-8 px-2 rounded-lg border border-teal-200 font-bold text-teal-950"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="checkbox"
                              checked={rule.is_active}
                              onChange={(e) => {
                                const updated = [...feeRules];
                                updated[idx] = {
                                  ...rule,
                                  is_active: e.target.checked,
                                };
                                setFeeRules(updated);
                              }}
                              className="w-4 h-4 accent-teal-700"
                            />
                          </td>
                          <td className="py-2 pl-2">
                            <button
                              type="button"
                              aria-label="Remove rule"
                              onClick={() =>
                                setFeeRules(feeRules.filter((_, i) => i !== idx))
                              }
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const last = feeRules[feeRules.length - 1];
                    setFeeRules([
                      ...feeRules,
                      {
                        fee_configuration_id: -Date.now(),
                        event_id: feeModalEvent.event_id,
                        min_graduating_year: last ? last.max_graduating_year + 1 : 1988,
                        max_graduating_year: LATEST_BATCH_YEAR,
                        membership_type: last?.membership_type ?? "UNREGISTERED_MEMBER",
                        registration_fee: 0,
                        display_order: (last?.display_order ?? 0) + 1,
                        is_active: true,
                        created_at: "",
                        updated_at: "",
                      } as EventFeeConfiguration,
                    ]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fee Rule</span>
                </button>

                <p className="text-[11px] text-teal-700/80">
                  The most specific match wins: a rule for the attendee&apos;s membership type and
                  batch first, then any rule covering their batch. Unmatched batches use the
                  default schedule.
                </p>

                {feeError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{feeError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-teal-100">
                  <button
                    onClick={() => setFeeModalEvent(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFeeRules}
                    disabled={savingFees}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingFees && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Fee Rules</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
