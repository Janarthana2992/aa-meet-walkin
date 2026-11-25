"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  Edit3,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { EventRegistration } from "@/types/database.types";
import { toCsv } from "@/server/utils/csvExport";
import {
  BATCH_YEARS,
  PAYMENT_MODES,
  REGISTRATION_SOURCES,
  STREAM_TYPES,
} from "@/server/constants";

interface RegistrationsDirectoryTabProps {
  registrations: EventRegistration[];
  searchQuery: string;
  filterBatch: string;
  filterStream: string;
  filterSource: string;
  filterPaymentMode: string;
  onSearchChange: (v: string) => void;
  onBatchChange: (v: string) => void;
  onStreamChange: (v: string) => void;
  onSourceChange: (v: string) => void;
  onPaymentModeChange: (v: string) => void;
  onRefresh: () => void;
}

export function RegistrationsDirectoryTab({
  registrations,
  searchQuery,
  filterBatch,
  filterStream,
  filterSource,
  filterPaymentMode,
  onSearchChange,
  onBatchChange,
  onStreamChange,
  onSourceChange,
  onPaymentModeChange,
  onRefresh,
}: RegistrationsDirectoryTabProps) {
  const [editing, setEditing] = useState<EventRegistration | null>(null);
  const [saving, setSaving] = useState(false);

  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const cols: [string, (r: EventRegistration) => unknown][] = [
      ["Pass No", (r) => `IRTTAA-${String(r.registration_id).padStart(4, "0")}`],
      ["Event ID", (r) => r.event_id],
      ["Member Login ID", (r) => r.member_login_id],
      ["Full Name", (r) => r.full_name],
      ["Email", (r) => r.email],
      ["Mobile", (r) => r.mobile],
      ["Course", (r) => r.course],
      ["Stream", (r) => r.stream],
      ["Graduating Year", (r) => r.graduating_year],
      ["Membership Used", (r) => r.membership_type_used],
      ["Source", (r) => r.registration_source],
      ["Recognized Member", (r) => (r.recognized_member ? "YES" : "NO")],
      ["Food Preference", (r) => r.food_preference],
      ["Accompanying Alumni", (r) => r.accompanying_alumni_count],
      ["Accompanying Family", (r) => r.accompanying_family_count],
      ["Registration Fee", (r) => r.registration_fee],
      ["Voluntary Contribution", (r) => r.voluntary_contribution],
      ["Total Amount", (r) => r.total_amount],
      ["Payment Mode", (r) => r.payment_mode || "NONE"],
      ["UTR Last 4", (r) => r.utr_last4],
      ["Payment Confirmed", (r) => (r.payment_confirmed ? "YES" : "NO")],
      ["Checked In At", (r) => r.checked_in_at],
    ];
    const csv = toCsv(
      cols.map(([header, value]) => ({ header, value: value as (row: never) => unknown })),
      registrations
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `IRTTAA_Registrations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/registrations/${editing.registration_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: editing.full_name,
            email: editing.email,
            mobile: editing.mobile,
            stream: editing.stream,
            graduatingYear: editing.graduating_year,
            foodPreference: editing.food_preference,
            accompanyingFamilyCount: editing.accompanying_family_count,
            registrationFee: editing.registration_fee,
            voluntaryContribution: editing.voluntary_contribution,
            paymentMode: editing.payment_mode,
            utrLast4: editing.utr_last4,
            paymentConfirmed: editing.payment_confirmed,
          }),
        }
      );
      if (res.ok) {
        setEditing(null);
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reg: EventRegistration) => {
    if (
      !confirm(
        `Delete registration #${reg.registration_id} for ${reg.full_name}?`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/registrations/${reg.registration_id}`, {
      method: "DELETE",
    });
    if (res.ok) onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Filters & Export Bar */}
      <div className="p-5 rounded-3xl bg-white border border-teal-100 shadow-lg shadow-teal-950/5 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search name, email, mobile, UTR..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <select
            value={filterBatch}
            onChange={(e) => onBatchChange(e.target.value)}
            className="h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 bg-white outline-none"
          >
            <option value="All">All Batches</option>
            {BATCH_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={filterStream}
            onChange={(e) => onStreamChange(e.target.value)}
            className="h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 bg-white outline-none"
          >
            <option value="All">All Streams</option>
            {STREAM_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterSource}
            onChange={(e) => onSourceChange(e.target.value)}
            className="h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 bg-white outline-none"
          >
            <option value="All">All Sources</option>
            {REGISTRATION_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>

          <select
            value={filterPaymentMode}
            onChange={(e) => onPaymentModeChange(e.target.value)}
            className="h-10 px-3 rounded-xl border border-teal-200 text-xs font-semibold text-teal-950 bg-white outline-none"
          >
            <option value="All">All Payments</option>
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="h-10 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV ({registrations.length})</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-lg shadow-teal-950/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-teal-50/70 border-b border-teal-100 text-[11px] font-bold uppercase text-teal-800">
              <tr>
                <th className="py-3.5 px-4">Alumni</th>
                <th className="py-3.5 px-4">Academic</th>
                <th className="py-3.5 px-4">Source & Status</th>
                <th className="py-3.5 px-4">Food & Family</th>
                <th className="py-3.5 px-4">Fees & Payment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {registrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-teal-700/70 font-medium"
                  >
                    No matching venue registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.registration_id} className="hover:bg-teal-50/30">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-teal-950">{reg.full_name}</div>
                      <div className="text-[11px] text-teal-700/75">{reg.email}</div>
                      <div className="text-[11px] text-teal-600/80 font-mono">
                        {reg.mobile || "—"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-teal-900">
                        {reg.graduating_year || "—"}
                      </div>
                      <div className="text-[11px] text-teal-700/80">
                        {reg.course || ""} {reg.stream || ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          reg.registration_source === "PRE_REGISTERED"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {reg.registration_source}
                      </span>
                      {reg.recognized_member && (
                        <div className="text-[10px] font-bold text-purple-700">
                          ✓ {reg.membership_type_used}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-teal-900">
                        {reg.food_preference || "Vegetarian"}
                      </div>
                      <div className="text-[11px] text-teal-700/70">
                        Family: {reg.accompanying_family_count} • Alumni:{" "}
                        {reg.accompanying_alumni_count}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-teal-950">
                        ₹{Number(reg.total_amount).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-teal-700/80">
                        Fee: ₹{reg.registration_fee} + Contrib: ₹
                        {reg.voluntary_contribution}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {reg.payment_required
                            ? `${reg.payment_mode}${
                                reg.utr_last4 ? ` (${reg.utr_last4})` : ""
                              }`
                            : "Free Entry"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setEditing(reg)}
                        className="p-2 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reg)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-teal-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black text-teal-950">
                Edit Registration #{editing.registration_id}
              </h4>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-teal-900 block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editing.full_name}
                    onChange={(e) =>
                      setEditing({ ...editing, full_name: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-900 block mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editing.mobile || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, mobile: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-900 block mb-1">Batch</label>
                  <input
                    type="number"
                    value={editing.graduating_year || ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        graduating_year: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-900 block mb-1">Stream</label>
                  <input
                    type="text"
                    value={editing.stream || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, stream: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-900 block mb-1">
                    Reg. Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={editing.registration_fee}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        registration_fee: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-900 block mb-1">
                    Contribution (₹)
                  </label>
                  <input
                    type="number"
                    value={editing.voluntary_contribution}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        voluntary_contribution: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-900 block mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={editing.payment_mode || "ONLINE"}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        payment_mode: e.target.value as "ONLINE" | "CASH",
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200 bg-white"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="CASH">CASH</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-teal-900 block mb-1">
                    UTR Last 4
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editing.utr_last4 || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, utr_last4: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-200 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl font-bold text-teal-800 bg-teal-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
