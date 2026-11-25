"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  IndianRupee,
  Building,
  Layers,
  CreditCard,
  Banknote,
  Utensils,
  Award,
  Clock,
} from "lucide-react";
import {
  CategoryCount,
  EventAnalyticsMetrics,
  EventRegistration,
} from "@/types/database.types";

interface OverviewAnalyticsTabProps {
  metrics: EventAnalyticsMetrics;
  batchAnalytics: CategoryCount[];
  streamAnalytics: CategoryCount[];
  foodAnalytics: CategoryCount[];
  recentRegistrations: EventRegistration[];
}

export function OverviewAnalyticsTab({
  metrics,
  batchAnalytics,
  streamAnalytics,
  foodAnalytics,
  recentRegistrations,
}: OverviewAnalyticsTabProps) {
  const maxBatchCount = Math.max(...batchAnalytics.map((b) => b.count), 1);
  const maxStreamCount = Math.max(...streamAnalytics.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Primary Financial & Attendance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-lg shadow-teal-950/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700/80">
              Venue Check-Ins
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-950">
            {metrics.total_registrations}
          </div>
          <div className="text-xs text-teal-700/80 font-medium mt-1.5 flex items-center gap-2">
            <span>Total Headcount: {metrics.total_headcount}</span>
            <span className="text-teal-300">•</span>
            <span>+{metrics.total_accompanying_family} Family</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-700 to-teal-800 text-white shadow-xl shadow-teal-900/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
              Total Collected
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black">
            ₹{metrics.total_collected.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-teal-100 font-medium mt-1.5 flex items-center gap-3">
            <span>Online: ₹{metrics.online_collected.toLocaleString("en-IN")}</span>
            <span>•</span>
            <span>Cash: ₹{metrics.cash_collected.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-lg shadow-teal-950/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700/80">
              Registration Fees
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-950">
            ₹{metrics.total_registration_fee.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1.5">
            Mandatory batch fee collection
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-amber-200/70 shadow-lg shadow-amber-950/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800/80">
              Voluntary Contributions
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-950">
            ₹{metrics.total_voluntary_contribution.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-amber-700 font-semibold mt-1.5">
            Optional alumni donations
          </div>
        </div>
      </div>

      {/* Secondary Breakdown Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-teal-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-teal-700/70">
              Pre-Reg Checked In
            </div>
            <div className="text-lg font-black text-teal-950">
              {metrics.pre_registered_checked_in}
              {metrics.pre_registrations_imported > 0 && (
                <span className="text-xs font-semibold text-teal-600/70 ml-1">
                  / {metrics.pre_registrations_imported}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-teal-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-teal-700/70">
              On-Spot Walk-Ins
            </div>
            <div className="text-lg font-black text-teal-950">
              {metrics.on_spot_registrations}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-teal-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-teal-700/70">
              Recognized Members
            </div>
            <div className="text-lg font-black text-teal-950">
              {metrics.recognized_members_count}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-teal-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-teal-700/70">
              Catering Split
            </div>
            <div className="text-xs font-bold text-teal-950 mt-0.5">
              {foodAnalytics.length > 0
                ? foodAnalytics.map((f) => `${f.category}: ${f.count}`).join(" • ")
                : "No check-ins yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Analytics */}
        <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-lg shadow-teal-950/5">
          <h3 className="text-sm font-black text-teal-950 uppercase tracking-wider flex items-center gap-2 mb-5">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Batch Year Turnout & Collection</span>
          </h3>
          {batchAnalytics.length === 0 ? (
            <p className="text-xs text-teal-700/60 py-8 text-center">
              No registrations recorded yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {batchAnalytics.map((b) => (
                <div key={b.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-teal-950">
                    <span>Batch {b.category}</span>
                    <span>
                      {b.count} alumni • ₹{(b.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-teal-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-600 to-teal-500 rounded-full"
                      style={{ width: `${(b.count / maxBatchCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stream Analytics */}
        <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-lg shadow-teal-950/5">
          <h3 className="text-sm font-black text-teal-950 uppercase tracking-wider flex items-center gap-2 mb-5">
            <Building className="w-4 h-4 text-orange-600" />
            <span>Department / Stream Turnout</span>
          </h3>
          {streamAnalytics.length === 0 ? (
            <p className="text-xs text-teal-700/60 py-8 text-center">
              No registrations recorded yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {streamAnalytics.map((s) => (
                <div key={s.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-teal-950">
                    <span>{s.category}</span>
                    <span>{s.count} alumni</span>
                  </div>
                  <div className="w-full h-2.5 bg-orange-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                      style={{ width: `${(s.count / maxStreamCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Check-Ins */}
      <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-lg shadow-teal-950/5">
        <h3 className="text-sm font-black text-teal-950 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Recent Venue Check-Ins</span>
        </h3>
        {recentRegistrations.length === 0 ? (
          <p className="text-xs text-teal-700/60 py-6 text-center">
            No venue check-ins yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-teal-100 text-[11px] font-bold uppercase text-teal-700/80">
                  <th className="pb-3 pr-4">Attendee</th>
                  <th className="pb-3 pr-4">Batch & Stream</th>
                  <th className="pb-3 pr-4">Source</th>
                  <th className="pb-3 pr-4">Fee + Donation</th>
                  <th className="pb-3 pr-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {recentRegistrations.map((reg) => (
                  <tr key={reg.registration_id}>
                    <td className="py-3 pr-4">
                      <div className="font-bold text-teal-950">{reg.full_name}</div>
                      <div className="text-[11px] text-teal-700/70">
                        {reg.email} {reg.mobile ? `• ${reg.mobile}` : ""}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-teal-900">
                      {reg.graduating_year || "—"} • {reg.stream || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          reg.registration_source === "PRE_REGISTERED"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {reg.registration_source === "PRE_REGISTERED"
                          ? "Pre-Registered"
                          : "On-Spot"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-teal-950">
                      ₹{Number(reg.total_amount).toLocaleString("en-IN")}
                      <span className="block text-[10px] font-medium text-teal-700/70">
                        Fee: ₹{reg.registration_fee} + Contrib: ₹
                        {reg.voluntary_contribution}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {reg.payment_required ? (
                        <span className="text-[11px] font-bold text-emerald-700">
                          {reg.payment_mode}
                          {reg.utr_last4 ? ` (UTR: ${reg.utr_last4})` : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-teal-700/70">
                          Free Entry
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
