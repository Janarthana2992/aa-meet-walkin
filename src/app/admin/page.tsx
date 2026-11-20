"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserCheck,
  UserPlus,
  IndianRupee,
  Calendar,
  Building,
  Download,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  ExternalLink,
  Layers,
} from "lucide-react";
import { Attendee, Event, EventMetrics } from "@/types/database.types";
import { BATCH_YEARS, DEPARTMENTS, EVENT_STATUSES, PAYMENT_STATUSES } from "@/server/constants";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "attendees" | "events">(
    "overview"
  );

  // Events State
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  // Dashboard Data State
  const [metrics, setMetrics] = useState<EventMetrics>({
    total: 0,
    checked_in: 0,
    walk_in: 0,
    pre_registered: 0,
    total_collection: 0,
    membership_total: 0,
    contribution_total: 0,
  });
  const [batchAnalytics, setBatchAnalytics] = useState<
    { category: string; count: number }[]
  >([]);
  const [departmentAnalytics, setDepartmentAnalytics] = useState<
    { category: string; count: number }[]
  >([]);
  const [recentAttendees, setRecentAttendees] = useState<Attendee[]>([]);

  // Attendee Management State
  const [allAttendees, setAllAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterCheckIn, setFilterCheckIn] = useState<"All" | "true" | "false">("All");

  // Edit Modal State
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // New Event Form State
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventSlug, setNewEventSlug] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);

  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>("admin@irttaa.org");

  // Check auth on mount
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("irttaa_admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin/login");
    } else {
      const email = sessionStorage.getItem("irttaa_admin_email");
      if (email) setAdminEmail(email);
    }
  }, [router]);

  // Load events
  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }
    } catch (err) {
      console.error("Error loading events", err);
    }
  }, []);

  // Load dashboard metrics
  const loadDashboardData = useCallback(async () => {
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
          setMetrics(json.data.metrics);
          setBatchAnalytics(json.data.batchAnalytics || []);
          setDepartmentAnalytics(json.data.departmentAnalytics || []);
          setRecentAttendees(json.data.recentAttendees || []);
        }
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  // Load attendee directory
  const loadAttendees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (filterBatch !== "All") params.set("batchYear", filterBatch);
      if (filterDept !== "All") params.set("stream", filterDept);
      if (filterPayment !== "All") params.set("paymentStatus", filterPayment);
      if (filterCheckIn !== "All") params.set("checkedIn", filterCheckIn);
      if (selectedEventId !== "all") params.set("eventId", selectedEventId);

      const res = await fetch(`/api/checkin/search?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAllAttendees(json.data || []);
      }
    } catch (err) {
      console.error("Error loading attendees", err);
    }
  }, [searchQuery, filterBatch, filterDept, filterPayment, filterCheckIn, selectedEventId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (activeTab === "attendees") {
      loadAttendees();
    }
  }, [activeTab, loadAttendees]);

  const handleLogout = () => {
    sessionStorage.removeItem("irttaa_admin_logged_in");
    sessionStorage.removeItem("irttaa_admin_email");
    router.push("/admin/login");
  };

  // CSV Export Function
  const handleExportCSV = () => {
    if (allAttendees.length === 0) return;

    const headers = [
      "Attendee ID",
      "Full Name",
      "Batch Year",
      "Department",
      "Mobile",
      "Email",
      "Registration Type",
      "Payment Status",
      "Payment Mode",
      "Total Paid",
      "Membership Amount",
      "Contribution Amount",
      "Checked In",
      "Checked In Time",
      "Food Preference",
      "Company",
      "City",
    ];

    const rows = allAttendees.map((a) => [
      a.attendee_id,
      `"${a.name || ""}"`,
      a.batch_year || "",
      `"${a.stream || ""}"`,
      `"${a.mobile || ""}"`,
      `"${a.email || ""}"`,
      a.registration_type || "",
      a.payment_status || "",
      a.payment_mode || "",
      a.amount_paid || 0,
      a.membership_amount || 0,
      a.contribution_amount || 0,
      a.checked_in ? "YES" : "NO",
      a.checked_in_at || "",
      `"${a.food_preference || ""}"`,
      `"${a.company || ""}"`,
      `"${a.city || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IRTTAA_Attendees_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Attendee Edit
  const handleSaveAttendeeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/attendees/${editingAttendee.attendee_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingAttendee.name,
          batch_year: Number(editingAttendee.batch_year),
          stream: editingAttendee.stream,
          mobile: editingAttendee.mobile,
          email: editingAttendee.email,
          city: editingAttendee.city,
          company: editingAttendee.company,
          amount_paid: Number(editingAttendee.amount_paid || 0),
          food_preference: editingAttendee.food_preference,
          payment_status: editingAttendee.payment_status,
          remarks: editingAttendee.remarks,
        }),
      });

      if (res.ok) {
        setEditingAttendee(null);
        loadAttendees();
        loadDashboardData();
      }
    } catch (err) {
      console.error("Failed to update attendee", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Attendee
  const handleDeleteAttendee = async (attendeeId: string) => {
    if (!confirm(`Are you sure you want to permanently delete attendee ${attendeeId}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/attendees/${attendeeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadAttendees();
        loadDashboardData();
      }
    } catch (err) {
      console.error("Failed to delete attendee", err);
    }
  };

  // Create Event Submit
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEvent(true);
    setCreateEventError(null);

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEventTitle.trim(),
          slug: newEventSlug.trim(),
          eventDate: newEventDate,
          eventTime: newEventTime.trim(),
          location: newEventLocation.trim(),
          status: "upcoming",
          isActive: true,
          registrationOpen: true,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowCreateEvent(false);
        setNewEventTitle("");
        setNewEventSlug("");
        setNewEventDate("");
        setNewEventTime("");
        setNewEventLocation("");
        loadEvents();
      } else {
        setCreateEventError(json.error || "Failed to create event");
      }
    } catch (err: unknown) {
      setCreateEventError(
        err instanceof Error ? err.message : "Failed to create event"
      );
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleSetActiveEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (res.ok) {
        loadEvents();
      }
    } catch (err) {
      console.error("Failed to set active event", err);
    }
  };

  const checkInRate =
    metrics.total > 0 ? Math.round((metrics.checked_in / metrics.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-teal-950/5 border border-teal-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-teal-200/80 bg-white flex items-center justify-center p-0.5">
              <Image
                src="/logo.png"
                alt="IRTTAA Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-teal-950 tracking-tight leading-none">
                IRTTAA Admin Control Center
              </h1>
              <p className="text-xs text-teal-700/80 font-medium mt-1">
                Alumni Association Executive & Committee Portal
              </p>
            </div>
          </div>

          {/* Event Filter & User Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Event Selector */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="h-10 px-3 rounded-xl border border-teal-200 bg-teal-50/50 text-xs font-bold text-teal-900 outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">All Events Combined</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                loadDashboardData();
                loadAttendees();
              }}
              title="Refresh Data"
              className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center hover:bg-teal-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-100/60 border border-teal-200 text-teal-900 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{adminEmail}</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-teal-200/80 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-teal-700 text-white shadow-md shadow-teal-800/20"
                : "bg-white text-teal-900 hover:bg-teal-50 border border-teal-200/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview & Live Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("attendees")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "attendees"
                ? "bg-teal-700 text-white shadow-md shadow-teal-800/20"
                : "bg-white text-teal-900 hover:bg-teal-50 border border-teal-200/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Attendee Directory ({metrics.total})</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "events"
                ? "bg-teal-700 text-white shadow-md shadow-teal-800/20"
                : "bg-white text-teal-900 hover:bg-teal-50 border border-teal-200/60"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Events Manager ({events.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & LIVE ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Section 1: Attendance KPIs */}
            <div>
              <div className="text-xs font-black text-teal-800 uppercase tracking-widest mb-3">
                ATTENDANCE METRICS
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
                  <div className="flex items-center justify-between text-teal-600 mb-2">
                    <span className="text-xs font-bold uppercase text-teal-700">
                      Total Headcount
                    </span>
                    <Users className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="text-3xl font-black text-teal-950">
                    {metrics.total}
                  </div>
                  <div className="text-[11px] text-teal-600 font-medium mt-1">
                    Pre-Registered + Walk-Ins
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xl shadow-teal-950/5">
                  <div className="flex items-center justify-between text-emerald-600 mb-2">
                    <span className="text-xs font-bold uppercase text-emerald-800">
                      Checked-In
                    </span>
                    <UserCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-black text-emerald-800">
                    {metrics.checked_in}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">
                    {checkInRate}% entry rate
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
                  <div className="flex items-center justify-between text-teal-600 mb-2">
                    <span className="text-xs font-bold uppercase text-teal-700">
                      Walk-In Attendees
                    </span>
                    <UserPlus className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="text-3xl font-black text-teal-950">
                    {metrics.walk_in}
                  </div>
                  <div className="text-[11px] text-teal-600 font-medium mt-1">
                    On-spot venue entries
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
                  <div className="flex items-center justify-between text-teal-600 mb-2">
                    <span className="text-xs font-bold uppercase text-teal-700">
                      Pre-Registered
                    </span>
                    <Clock className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="text-3xl font-black text-teal-950">
                    {metrics.pre_registered}
                  </div>
                  <div className="text-[11px] text-teal-600 font-medium mt-1">
                    Registered in advance
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Financial Collections KPIs */}
            <div>
              <div className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3">
                FINANCIAL COLLECTIONS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-700 text-white shadow-xl shadow-teal-900/15">
                  <span className="text-xs font-bold uppercase text-teal-200">
                    Total Collections
                  </span>
                  <div className="text-3xl sm:text-4xl font-black mt-1">
                    ₹{metrics.total_collection.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-teal-100/80 mt-2 font-medium">
                    Consolidated association funds received
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
                  <span className="text-xs font-bold uppercase text-teal-700">
                    Membership Subscriptions
                  </span>
                  <div className="text-3xl font-black text-teal-950 mt-1">
                    ₹{metrics.membership_total.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-teal-600 font-medium mt-2">
                    Life & Patron membership fees
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
                  <span className="text-xs font-bold uppercase text-orange-700">
                    Voluntary Contributions
                  </span>
                  <div className="text-3xl font-black text-teal-950 mt-1">
                    ₹{metrics.contribution_total.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-teal-600 font-medium mt-2">
                    Donations for student development
                  </div>
                </div>
              </div>
            </div>

            {/* Event Check-In Rate Bar & Quick Ratio */}
            <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-teal-950">
                  Event Attendance Completion
                </span>
                <span className="text-sm font-black text-teal-700">
                  {metrics.checked_in} / {metrics.total} checked in ({checkInRate}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-teal-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${checkInRate}%` }}
                />
              </div>
            </div>

            {/* Section 3: Visual Analytics (Department & Batch Distribution) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Breakdown */}
              <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
                <h3 className="text-base font-bold text-teal-950 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-700" />
                  <span>Department Distribution</span>
                </h3>
                <div className="space-y-3">
                  {departmentAnalytics.slice(0, 7).map((d) => (
                    <div key={d.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-teal-950">{d.category}</span>
                        <span className="text-teal-700 font-bold">{d.count} alumni</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-teal-50">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{
                            width: `${(d.count / (metrics.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch Trends */}
              <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5">
                <h3 className="text-base font-bold text-teal-950 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  <span>Batch Trends</span>
                </h3>
                <div className="space-y-3">
                  {batchAnalytics.slice(0, 7).map((b) => (
                    <div key={b.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-teal-950">Batch {b.category}</span>
                        <span className="text-teal-700 font-bold">{b.count} alumni</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-teal-50">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${(b.count / (metrics.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDEES DIRECTORY & CSV EXPORT */}
        {activeTab === "attendees" && (
          <div className="space-y-6">
            {/* Filter and Export Action Bar */}
            <div className="p-5 rounded-2xl bg-white border border-teal-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 absolute inset-y-0 left-3.5 my-auto text-teal-600" />
                  <input
                    type="text"
                    placeholder="Search name or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleExportCSV}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV ({allAttendees.length})</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-teal-200 text-xs font-semibold text-teal-900 bg-teal-50/40"
                >
                  <option value="All">All Batches</option>
                  {BATCH_YEARS.map((y) => (
                    <option key={y} value={y.toString()}>
                      Batch {y}
                    </option>
                  ))}
                </select>

                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-teal-200 text-xs font-semibold text-teal-900 bg-teal-50/40"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-teal-200 text-xs font-semibold text-teal-900 bg-teal-50/40"
                >
                  <option value="All">All Payments</option>
                  {PAYMENT_STATUSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCheckIn}
                  onChange={(e) =>
                    setFilterCheckIn(e.target.value as "All" | "true" | "false")
                  }
                  className="h-9 px-2.5 rounded-lg border border-teal-200 text-xs font-semibold text-teal-900 bg-teal-50/40"
                >
                  <option value="All">All Entry Statuses</option>
                  <option value="true">Checked In Only</option>
                  <option value="false">Pending Only</option>
                </select>
              </div>
            </div>

            {/* Attendees Data Table */}
            <div className="bg-white rounded-3xl border border-teal-100 shadow-xl shadow-teal-950/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-teal-900">
                  <thead className="bg-teal-50/80 text-teal-800 uppercase tracking-wider font-bold border-b border-teal-100">
                    <tr>
                      <th className="py-3.5 px-4">Attendee ID</th>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Batch & Dept</th>
                      <th className="py-3.5 px-4">Mobile</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-100/60 font-medium">
                    {allAttendees.map((a) => (
                      <tr key={a.attendee_id} className="hover:bg-teal-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-teal-700">
                          {a.attendee_id}
                        </td>
                        <td className="py-3 px-4 font-bold text-teal-950">{a.name}</td>
                        <td className="py-3 px-4">
                          {a.batch_year} • {a.stream}
                        </td>
                        <td className="py-3 px-4 font-semibold">{a.mobile}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              a.registration_type === "Walk-In"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-teal-100 text-teal-900"
                            }`}
                          >
                            {a.registration_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {a.checked_in ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Checked In</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-teal-950">
                          ₹{Number(a.amount_paid || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingAttendee(a)}
                            className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttendee(a.attendee_id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS MANAGEMENT */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-teal-950">
                  Association Chapter Meets
                </h3>
                <p className="text-xs text-teal-700/80 mt-0.5">
                  Manage multiple events, dates, and active registration targets.
                </p>
              </div>

              <button
                onClick={() => setShowCreateEvent(!showCreateEvent)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Create Event Form Drawer */}
            <AnimatePresence>
              {showCreateEvent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 rounded-3xl bg-white border border-teal-200 shadow-lg"
                >
                  <h4 className="text-base font-bold text-teal-950 mb-4">
                    Post New Alumni Meet
                  </h4>
                  {createEventError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{createEventError}</span>
                    </div>
                  )}
                  <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Coimbatore Chapter Meet 2027"
                          value={newEventTitle}
                          onChange={(e) => {
                            setNewEventTitle(e.target.value);
                            setNewEventSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)+/g, "")
                            );
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                          Slug (URL Path) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="coimbatore-chapter-meet-2027"
                          value={newEventSlug}
                          onChange={(e) => setNewEventSlug(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                          Event Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                          Event Time
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 09:30 AM - 05:00 PM"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                          Location / City *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Coimbatore, Tamil Nadu"
                          value={newEventLocation}
                          onChange={(e) => setNewEventLocation(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateEvent(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creatingEvent}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                      >
                        {creatingEvent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Publish Event</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-6 rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-950/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900">
                        {ev.status}
                      </span>
                      {ev.is_active && (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active Event</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xl font-black text-teal-950">{ev.title}</h4>
                    <p className="text-xs text-teal-700/80 font-medium mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{ev.event_date}</span>
                      <span>•</span>
                      <span>{ev.location}</span>
                    </p>
                    {ev.description && (
                      <p className="text-xs text-teal-900/70 mt-3 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-teal-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-teal-600 text-[11px]">
                      Slug: /{ev.slug}
                    </span>
                    <div className="flex items-center gap-2">
                      {!ev.is_active && (
                        <button
                          onClick={() => handleSetActiveEvent(ev.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 border border-teal-200 transition-colors cursor-pointer"
                        >
                          Set as Active
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedEventId(ev.id)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Filter Analytics</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Attendee Modal */}
        <AnimatePresence>
          {editingAttendee && (
            <div className="fixed inset-0 z-50 bg-teal-950/50 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-teal-200 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                  <h3 className="text-lg font-bold text-teal-950">
                    Edit Attendee Details
                  </h3>
                  <span className="text-xs font-mono font-bold text-teal-700">
                    {editingAttendee.attendee_id}
                  </span>
                </div>

                <form onSubmit={handleSaveAttendeeEdit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editingAttendee.name}
                        onChange={(e) =>
                          setEditingAttendee({ ...editingAttendee, name: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                        Batch Year
                      </label>
                      <input
                        type="number"
                        value={editingAttendee.batch_year || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            batch_year: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editingAttendee.stream || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            stream: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        value={editingAttendee.mobile}
                        onChange={(e) =>
                          setEditingAttendee({ ...editingAttendee, mobile: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editingAttendee.email || ""}
                        onChange={(e) =>
                          setEditingAttendee({ ...editingAttendee, email: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-teal-100">
                    <button
                      type="button"
                      onClick={() => setEditingAttendee(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                    >
                      {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
