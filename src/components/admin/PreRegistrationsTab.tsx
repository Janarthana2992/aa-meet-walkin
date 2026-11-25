"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  CsvImportSummary,
  Event,
  EventPreRegistration,
} from "@/types/database.types";
import { PRE_REGISTRATION_RESPONSE_STATUSES } from "@/server/constants";

interface PreRegistrationsTabProps {
  events: Event[];
  defaultEventId?: number;
}

export function PreRegistrationsTab({
  events,
  defaultEventId,
}: PreRegistrationsTabProps) {
  const [targetEventId, setTargetEventId] = useState<number>(
    defaultEventId || (events[0]?.event_id ?? 0)
  );
  const [records, setRecords] = useState<EventPreRegistration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // CSV Upload state
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportSummary | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetEventId && events.length > 0) {
      const active = events.find((e) => e.is_active) || events[0];
      setTargetEventId(active.event_id);
    }
  }, [events, targetEventId]);

  const loadRecords = useCallback(async () => {
    if (!targetEventId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "All") params.append("responseStatus", statusFilter);

      const res = await fetch(
        `/api/admin/events/${targetEventId}/pre-registrations?${params.toString()}`
      );
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data || []);
        setTotalCount(json.totalCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [targetEventId, search, statusFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetEventId) return;

    setUploading(true);
    setImportResult(null);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `/api/admin/events/${targetEventId}/pre-registrations`,
        {
          method: "POST",
          body: formData,
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "CSV import failed");
      }
      setImportResult(json.data);
      loadRecords();
    } catch (err: unknown) {
      setImportError(
        err instanceof Error ? err.message : "Failed to import CSV file"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="p-6 rounded-3xl bg-white border border-teal-200 shadow-lg shadow-teal-950/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-black text-teal-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-700" />
              <span>Import Event Pre-Registrations CSV</span>
            </h3>
            <p className="text-xs text-teal-700/80 mt-1">
              Upload the official IRTTAA website export (`event_pre_registrations.csv`). The selected event ID is automatically assigned and re-imports safely avoid duplicates.
            </p>
          </div>
          <div className="min-w-[240px]">
            <label className="block text-[10px] font-bold uppercase text-teal-800 mb-1">
              Target Event *
            </label>
            <select
              value={targetEventId}
              onChange={(e) => setTargetEventId(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-teal-200 text-xs font-bold text-teal-950 bg-white outline-none focus:ring-2 focus:ring-teal-600"
            >
              {events.length === 0 && (
                <option value={0}>Create an event first</option>
              )}
              {events.map((ev) => (
                <option key={ev.event_id} value={ev.event_id}>
                  #{ev.event_id} — {ev.event_name}{" "}
                  {ev.is_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all ${
            targetEventId
              ? "border-teal-300 bg-teal-50/40 hover:bg-teal-50 cursor-pointer"
              : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
          }`}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={!targetEventId || uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Parsing CSV & updating Event #{targetEventId}...</span>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <Upload className="w-7 h-7 text-teal-700 mx-auto" />
              <div className="text-xs font-bold text-teal-950">
                Click to select `event_pre_registrations.csv`
              </div>
              <div className="text-[11px] text-teal-700/70">
                Upserts uniquely by `(event_id, email)` and maps accompanying count to family count
              </div>
            </div>
          )}
        </label>

        {importResult && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                Import Successful: {importResult.importedCount} of{" "}
                {importResult.totalRows} rows saved/updated!
              </div>
              {importResult.skippedCount > 0 && (
                <div className="text-[11px] mt-0.5">
                  Skipped rows: {importResult.skippedCount}
                </div>
              )}
              {importResult.errors.length > 0 && (
                <ul className="mt-1 list-disc list-inside text-[11px] text-rose-700">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {importError && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{importError}</span>
          </div>
        )}
      </div>

      {/* Filter & List */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-lg shadow-teal-950/5 overflow-hidden">
        <div className="p-5 border-b border-teal-100 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="text-sm font-black text-teal-950">
            Imported Pre-Registrations ({totalCount})
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-teal-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, email, mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-xl border border-teal-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-teal-200 text-xs font-semibold bg-white outline-none"
            >
              <option value="All">All Statuses</option>
              {PRE_REGISTRATION_RESPONSE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-teal-50/70 border-b border-teal-100 text-[11px] font-bold uppercase text-teal-800">
              <tr>
                <th className="py-3 px-4">Alumni</th>
                <th className="py-3 px-4">Academic</th>
                <th className="py-3 px-4">Food & Family</th>
                <th className="py-3 px-4">Response Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-700 mx-auto" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-teal-700/70 font-medium"
                  >
                    No pre-registrations imported for this event yet.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.pre_registration_id} className="hover:bg-teal-50/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-teal-950">{rec.full_name}</div>
                      <div className="text-[11px] text-teal-700/80">{rec.email}</div>
                      <div className="text-[11px] font-mono text-teal-600">
                        {rec.mobile || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-teal-900">
                        {rec.graduating_year || "—"}
                      </div>
                      <div className="text-[11px] text-teal-700/80">
                        {rec.course || ""} • {rec.stream || ""}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-teal-900">
                        {rec.food_preference || "Vegetarian"}
                      </div>
                      <div className="text-[11px] text-teal-700/70">
                        Accompanying Family: {rec.accompanying_family_count}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rec.response_status === "GOING"
                            ? "bg-emerald-50 text-emerald-700"
                            : rec.response_status === "MAY_BE"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {rec.response_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
