"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  UserCheck,
  Clock,
  Filter,
  UserPlus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { Attendee, Event } from "@/types/database.types";
import { BATCH_YEARS, DEPARTMENTS } from "@/server/constants";
import { AttendeeCheckInCard } from "@/components/checkin/AttendeeCheckInCard";

export default function CheckInPage() {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");
  const [selectedStream, setSelectedStream] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "pending" | "checked_in">("All");

  // Attendees Data State
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active event
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch("/api/events/active");
        if (res.ok) {
          const json = await res.json();
          if (json.data) setActiveEvent(json.data);
        }
      } catch (err) {
        console.error("Could not fetch active event", err);
      }
    }
    fetchEvent();
  }, []);

  // Fetch attendees based on search and filters
  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedBatch !== "All") params.set("batchYear", selectedBatch);
      if (selectedStream !== "All") params.set("stream", selectedStream);
      if (statusFilter === "pending") params.set("checkedIn", "false");
      if (statusFilter === "checked_in") params.set("checkedIn", "true");
      if (activeEvent?.id) params.set("eventId", activeEvent.id);

      const res = await fetch(`/api/checkin/search?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to search attendees");
      }

      setAttendees(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error searching attendees");
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedBatch, selectedStream, statusFilter, activeEvent?.id]);

  // Trigger search with debounce on searchQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendees();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAttendees]);

  // Handle successful check-in callback
  const handleCheckInSuccess = (updated: Attendee) => {
    setAttendees((prev) =>
      prev.map((a) => (a.attendee_id === updated.attendee_id ? updated : a))
    );
  };

  const checkedInCount = attendees.filter((a) => a.checked_in).length;
  const pendingCount = attendees.length - checkedInCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-850 hover:text-teal-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </Link>
          <div className="text-right">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">
              {activeEvent ? activeEvent.title : "IRTTAA Alumni Meet"}
            </span>
            <span className="text-[11px] text-teal-600/80 font-medium">
              Volunteer Check-In Desk
            </span>
          </div>
        </div>

        {/* Title Bar & Quick Stats */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/5 border border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Fast Desk Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-teal-950">
              Search & Check-In Desk
            </h1>
            <p className="text-sm text-teal-850/70 mt-1">
              Verify pre-registered alumni by Mobile Number, Name, or Batch Year.
            </p>
          </div>

          {/* Quick Counter Chips */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                Found
              </span>
              <span className="text-xl font-black text-teal-950">
                {attendees.length}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Checked-In
              </span>
              <span className="text-xl font-black text-emerald-800">
                {checkedInCount}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Pending
              </span>
              <span className="text-xl font-black text-amber-800">
                {pendingCount}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md shadow-teal-950/5 border border-teal-100 space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-teal-600">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by Name or 10-digit Mobile Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 pl-11 pr-4 rounded-xl border border-teal-200 bg-teal-50/30 text-teal-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-teal-600">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          {/* Filter Dropdowns & Status Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Batch Filter */}
            <div>
              <label className="block text-[11px] font-bold text-teal-800 uppercase mb-1">
                Batch Year
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 bg-white focus:ring-2 focus:ring-teal-600 outline-none"
              >
                <option value="All">All Batches (1988 - 2027)</option>
                {BATCH_YEARS.map((y) => (
                  <option key={y} value={y.toString()}>
                    Batch {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-[11px] font-bold text-teal-800 uppercase mb-1">
                Department
              </label>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 bg-white focus:ring-2 focus:ring-teal-600 outline-none"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-teal-800 uppercase mb-1">
                Entry Status
              </label>
              <div className="grid grid-cols-3 gap-1 h-10 p-1 bg-teal-50 border border-teal-200 rounded-xl">
                {(["All", "pending", "checked_in"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`text-[11px] font-bold rounded-lg transition-all ${
                      statusFilter === s
                        ? "bg-white text-teal-950 shadow-sm border border-teal-200/60"
                        : "text-teal-700 hover:text-teal-950"
                    }`}
                  >
                    {s === "All"
                      ? "All"
                      : s === "pending"
                      ? "Pending"
                      : "Checked"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        {error ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">Error loading attendees</span>
              <span>{error}</span>
            </div>
          </div>
        ) : loading && attendees.length === 0 ? (
          <div className="p-16 text-center text-teal-700 bg-white rounded-3xl border border-teal-100">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-600" />
            <p className="text-sm font-semibold">Searching attendees database...</p>
          </div>
        ) : attendees.length === 0 ? (
          /* Empty State - Prompt to Walk-In Register */
          <div className="p-12 text-center bg-white rounded-3xl border border-teal-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-teal-950">
                No matching attendee found
              </h3>
              <p className="text-xs text-teal-700/80 max-w-md mx-auto mt-1">
                The alumnus may not have pre-registered. You can register them on
                the spot in under 30 seconds.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Proceed with Walk-In Registration</span>
            </Link>
          </div>
        ) : (
          /* Attendee Cards Grid */
          <div className="space-y-3">
            {attendees.map((attendee) => (
              <AttendeeCheckInCard
                key={attendee.attendee_id}
                attendee={attendee}
                onCheckInSuccess={handleCheckInSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
