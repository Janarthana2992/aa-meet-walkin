"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";
import { AssociationMember, CsvImportSummary } from "@/types/database.types";
import { ASSOCIATION_MEMBERSHIP_TYPES } from "@/server/constants";

export function AssociationMembersTab() {
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // CSV Upload state
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportSummary | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (typeFilter !== "All") params.append("membershipType", typeFilter);

      const res = await fetch(`/api/admin/members?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data || []);
        setTotalCount(json.totalCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setImportResult(null);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/members", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Members CSV import failed");
      }
      setImportResult(json.data);
      loadMembers();
    } catch (err: unknown) {
      setImportError(
        err instanceof Error ? err.message : "Failed to import members CSV"
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
        <div className="mb-4">
          <h3 className="text-lg font-black text-teal-950 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>Import IRTTAA Association Members CSV</span>
          </h3>
          <p className="text-xs text-teal-700/80 mt-1">
            Upload `IRTT_AA_Members.csv` anytime. New members are appended cleanly, and existing members are updated automatically if their membership tier or contact details changed.
          </p>
        </div>

        <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 hover:bg-amber-50/70 transition-all cursor-pointer">
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Parsing CSV & upserting Association Members...</span>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <Upload className="w-7 h-7 text-amber-600 mx-auto" />
              <div className="text-xs font-bold text-teal-950">
                Click to select `IRTT_AA_Members.csv`
              </div>
              <div className="text-[11px] text-teal-700/70">
                Normalizes courses (`B.E. → BE`), streams, phone formats & membership tiers
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
                {importResult.totalRows} members saved/updated!
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

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-lg shadow-teal-950/5 overflow-hidden">
        <div className="p-5 border-b border-teal-100 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="text-sm font-black text-teal-950">
            Recognized Association Members ({totalCount})
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-teal-200 text-xs font-semibold bg-white outline-none"
            >
              <option value="All">All Tiers</option>
              {ASSOCIATION_MEMBERSHIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-teal-50/70 border-b border-teal-100 text-[11px] font-bold uppercase text-teal-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Academic</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Membership Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-700 mx-auto" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-teal-700/70 font-medium"
                  >
                    No association members imported yet. Upload `IRTT_AA_Members.csv` above.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.member_login_id} className="hover:bg-teal-50/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-teal-950">{m.full_name}</div>
                      <div className="text-[11px] text-teal-700/80">{m.email}</div>
                      <div className="text-[11px] font-mono text-teal-600">
                        {m.mobile || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-teal-900">
                        {m.graduating_year || "—"}
                      </div>
                      <div className="text-[11px] text-teal-700/80">
                        {m.course || ""} {m.stream || ""}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-teal-800">
                      {[m.city, m.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          m.membership_type === "PATRON_MEMBER"
                            ? "bg-amber-100 text-amber-900"
                            : m.membership_type === "LIFE_MEMBER"
                            ? "bg-purple-100 text-purple-900"
                            : "bg-teal-100 text-teal-900"
                        }`}
                      >
                        {m.membership_type.replace("_", " ")}
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
