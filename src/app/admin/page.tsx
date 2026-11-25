"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Calendar,
  RefreshCw,
  LogOut,
  ExternalLink,
  Layers,
  Award,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import {
  CategoryCount,
  Event,
  EventAnalyticsMetrics,
  EventRegistration,
} from "@/types/database.types";
import { OverviewAnalyticsTab } from "@/components/admin/OverviewAnalyticsTab";
import { RegistrationsDirectoryTab } from "@/components/admin/RegistrationsDirectoryTab";
import { EventsManagerTab } from "@/components/admin/EventsManagerTab";
import { PreRegistrationsTab } from "@/components/admin/PreRegistrationsTab";
import { AssociationMembersTab } from "@/components/admin/AssociationMembersTab";

type AdminTab = "overview" | "registrations" | "events" | "prereg" | "members";

const EMPTY_METRICS: EventAnalyticsMetrics = {
  total_registrations: 0,
  pre_registered_checked_in: 0,
  on_spot_registrations: 0,
  recognized_members_count: 0,
  pre_registrations_imported: 0,
  total_registration_fee: 0,
  total_voluntary_contribution: 0,
  total_collected: 0,
  online_collected: 0,
  cash_collected: 0,
  total_accompanying_alumni: 0,
  total_accompanying_family: 0,
  total_headcount: 0,
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [adminEmail, setAdminEmail] = useState<string>("admin@irttaa.org");

  // Events
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  // Analytics state
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<EventAnalyticsMetrics>(EMPTY_METRICS);
  const [batchAnalytics, setBatchAnalytics] = useState<CategoryCount[]>([]);
  const [streamAnalytics, setStreamAnalytics] = useState<CategoryCount[]>([]);
  const [foodAnalytics, setFoodAnalytics] = useState<CategoryCount[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<
    EventRegistration[]
  >([]);

  // Registrations Directory state
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("All");
  const [filterStream, setFilterStream] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterPaymentMode, setFilterPaymentMode] = useState("All");

  // Auth Check (the middleware already blocks unauthenticated access;
  // this only resolves the signed-in organizer's email for display)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.success || json.data.role !== "admin") {
          router.replace("/admin/login?next=/admin");
        } else if (json.data.email) {
          setAdminEmail(json.data.email);
        }
      })
      .catch(() => undefined);
  }, [router]);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load events", err);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedEventId !== "all"
          ? `/api/admin/dashboard?eventId=${selectedEventId}`
          : "/api/admin/dashboard";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMetrics(json.data.metrics || EMPTY_METRICS);
          setBatchAnalytics(json.data.batchAnalytics || []);
          setStreamAnalytics(json.data.streamAnalytics || []);
          setFoodAnalytics(json.data.foodAnalytics || []);
          setRecentRegistrations(json.data.recentRegistrations || []);
        }
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  const loadRegistrations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEventId !== "all") params.append("eventId", selectedEventId);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (filterBatch !== "All") params.append("graduatingYear", filterBatch);
      if (filterStream !== "All") params.append("stream", filterStream);
      if (filterSource !== "All")
        params.append("registrationSource", filterSource);
      if (filterPaymentMode !== "All")
        params.append("paymentMode", filterPaymentMode);

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load registrations", err);
    }
  }, [
    selectedEventId,
    searchQuery,
    filterBatch,
    filterStream,
    filterSource,
    filterPaymentMode,
  ]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (activeTab === "registrations") {
      loadRegistrations();
    }
  }, [activeTab, loadRegistrations]);

  const handleRefreshAll = () => {
    loadEvents();
    loadAnalytics();
    if (activeTab === "registrations") loadRegistrations();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
  };

  const activeEventObj = events.find((e) => e.is_active) || events[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navbar */}
        <header className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-teal-950/5 border border-teal-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-teal-200/80 bg-white flex items-center justify-center p-0.5">
              <Image
                src="/logo.png"
                alt="IRTTAA Official Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-teal-950 tracking-tight">
                IRTTAA NuzhAI Admin Portal
              </h1>
              <p className="text-xs text-teal-700/80 font-medium">
                Signed in as <span className="font-bold">{adminEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="h-10 px-3 rounded-xl border border-teal-200 bg-teal-50/50 text-xs font-bold text-teal-950 outline-none"
            >
              <option value="all">All Events Combined</option>
              {events.map((ev) => (
                <option key={ev.event_id} value={ev.event_id}>
                  #{ev.event_id} — {ev.event_name}
                  {ev.is_active ? " (Active)" : ""}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefreshAll}
              className="h-10 px-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <Link
              href="/"
              className="h-10 px-3.5 rounded-xl bg-white hover:bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="h-10 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-teal-700 text-white shadow-lg shadow-teal-800/20"
                : "bg-white text-teal-900 border border-teal-100 hover:bg-teal-50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("registrations")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "registrations"
                ? "bg-teal-700 text-white shadow-lg shadow-teal-800/20"
                : "bg-white text-teal-900 border border-teal-100 hover:bg-teal-50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Venue Registrations ({metrics.total_registrations})</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "events"
                ? "bg-teal-700 text-white shadow-lg shadow-teal-800/20"
                : "bg-white text-teal-900 border border-teal-100 hover:bg-teal-50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Events & Fee Rules ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("prereg")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "prereg"
                ? "bg-teal-700 text-white shadow-lg shadow-teal-800/20"
                : "bg-white text-teal-900 border border-teal-100 hover:bg-teal-50"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Pre-Registrations Import</span>
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "members"
                ? "bg-teal-700 text-white shadow-lg shadow-teal-800/20"
                : "bg-white text-teal-900 border border-teal-100 hover:bg-teal-50"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Association Members</span>
          </button>
        </nav>

        {/* Tab Content */}
        {loading && activeTab === "overview" ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
          </div>
        ) : activeTab === "overview" ? (
          <OverviewAnalyticsTab
            metrics={metrics}
            batchAnalytics={batchAnalytics}
            streamAnalytics={streamAnalytics}
            foodAnalytics={foodAnalytics}
            recentRegistrations={recentRegistrations}
          />
        ) : activeTab === "registrations" ? (
          <RegistrationsDirectoryTab
            registrations={registrations}
            searchQuery={searchQuery}
            filterBatch={filterBatch}
            filterStream={filterStream}
            filterSource={filterSource}
            filterPaymentMode={filterPaymentMode}
            onSearchChange={setSearchQuery}
            onBatchChange={setFilterBatch}
            onStreamChange={setFilterStream}
            onSourceChange={setFilterSource}
            onPaymentModeChange={setFilterPaymentMode}
            onRefresh={() => {
              loadRegistrations();
              loadAnalytics();
            }}
          />
        ) : activeTab === "events" ? (
          <EventsManagerTab
            events={events}
            onEventsUpdated={() => {
              loadEvents();
              loadAnalytics();
            }}
            onFilterAnalytics={(eventId) => {
              setSelectedEventId(String(eventId));
              setActiveTab("overview");
            }}
          />
        ) : activeTab === "prereg" ? (
          <PreRegistrationsTab
            events={events}
            defaultEventId={activeEventObj?.event_id}
          />
        ) : (
          <AssociationMembersTab />
        )}
      </div>
    </div>
  );
}
