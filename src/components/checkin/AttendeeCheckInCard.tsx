"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Clock,
  Phone,
  Mail,
  Building,
  Utensils,
  ChevronDown,
  ChevronUp,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import { Attendee } from "@/types/database.types";
import { MEMBERSHIP_OPTIONS, PAYMENT_MODES, PaymentMode } from "@/server/constants";

interface AttendeeCheckInCardProps {
  attendee: Attendee;
  onCheckInSuccess: (updated: Attendee) => void;
}

export function AttendeeCheckInCard({
  attendee,
  onCheckInSuccess,
}: AttendeeCheckInCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State for Check-In payment update
  const [mobile, setMobile] = useState(attendee.mobile || "");
  const [email, setEmail] = useState(attendee.email || "");
  const [membershipType, setMembershipType] = useState("None");
  const [membershipAmount, setMembershipAmount] = useState(
    Number(attendee.membership_amount) || 0
  );
  const [contributionAmount, setContributionAmount] = useState(
    Number(attendee.contribution_amount) || 0
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    attendee.payment_mode || "UPI"
  );
  const [remarks, setRemarks] = useState(attendee.remarks || "");

  const totalPayment = membershipAmount + contributionAmount;

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        mobile: mobile.trim(),
        email: email.trim(),
        membershipAmount,
        contributionAmount,
        amountPaid: totalPayment,
        paymentMode,
        paymentStatus: "Paid",
        remarks: remarks.trim(),
      };

      const res = await fetch(`/api/checkin/${attendee.attendee_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to check in attendee");
      }

      onCheckInSuccess(result.data);
      setIsExpanded(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        attendee.checked_in
          ? "bg-white/90 border-emerald-200 shadow-sm"
          : "bg-white border-teal-200/90 shadow-md shadow-teal-900/5 hover:border-teal-300"
      }`}
    >
      {/* Collapsed Header / Summary Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
              attendee.checked_in
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-teal-100 text-teal-900 border border-teal-200"
            }`}
          >
            {attendee.checked_in ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            ) : (
              <span>{attendee.batch_year || "AA"}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-teal-950">
                {attendee.name}
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                {attendee.attendee_id}
              </span>
            </div>

            <p className="text-xs text-teal-700/80 font-medium mt-1 flex items-center gap-2 flex-wrap">
              <span>{attendee.stream || "General"}</span>
              <span>•</span>
              <span>Batch {attendee.batch_year || "N/A"}</span>
              <span>•</span>
              <span className="text-teal-900 font-semibold">{attendee.mobile}</span>
            </p>
          </div>
        </div>

        {/* Right Status Badge & Expand Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {attendee.checked_in ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Checked In{" "}
                {attendee.checked_in_at &&
                  new Date(attendee.checked_in_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Entry</span>
            </div>
          )}

          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-100">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Action Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-teal-100 bg-teal-50/40 p-5 sm:p-6"
          >
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {attendee.checked_in ? (
              /* Already Checked In View */
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white border border-teal-100">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase">
                      Email
                    </span>
                    <p className="text-xs font-semibold text-teal-950 mt-0.5">
                      {attendee.email || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase">
                      Food Preference
                    </span>
                    <p className="text-xs font-semibold text-teal-950 mt-0.5">
                      {attendee.food_preference || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase">
                      Family Members
                    </span>
                    <p className="text-xs font-semibold text-teal-950 mt-0.5">
                      {attendee.family_members || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase">
                      Total Paid
                    </span>
                    <p className="text-xs font-black text-emerald-700 mt-0.5">
                      ₹{Number(attendee.amount_paid || 0).toLocaleString("en-IN")}{" "}
                      ({attendee.payment_mode || "Online"})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold bg-emerald-100/60 p-3 rounded-xl border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Attendee badge delivered and check-in confirmed.</span>
                  </span>
                  <span>ID: {attendee.attendee_id}</span>
                </div>
              </div>
            ) : (
              /* Pending Check-In Form */
              <form onSubmit={handleCheckInSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                      Verify Mobile
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-10 px-3 rounded-xl border border-teal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                      Verify Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Optional"
                      className="w-full h-10 px-3 rounded-xl border border-teal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                      Food Preference
                    </label>
                    <div className="h-10 px-3 rounded-xl bg-teal-100/60 border border-teal-200 text-xs font-semibold text-teal-900 flex items-center">
                      {attendee.food_preference || "Vegetarian"} (
                      {attendee.family_members || 0} guest)
                    </div>
                  </div>
                </div>

                {/* Desk Payment Collection Row */}
                <div className="p-4 rounded-xl bg-white border border-teal-200 space-y-4">
                  <span className="text-xs font-bold text-teal-900 uppercase flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                    <span>Desk Payment & Upgrade Collection</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] text-teal-800 font-medium mb-1">
                        Membership Plan
                      </label>
                      <select
                        value={membershipType}
                        onChange={(e) => {
                          const opt = MEMBERSHIP_OPTIONS.find(
                            (o) => o.value === e.target.value
                          );
                          setMembershipType(e.target.value);
                          setMembershipAmount(opt ? opt.amount : 0);
                        }}
                        className="w-full h-10 px-2.5 rounded-lg border border-teal-200 text-xs font-semibold text-teal-950 focus:ring-2 focus:ring-teal-600 outline-none"
                      >
                        {MEMBERSHIP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-teal-800 font-medium mb-1">
                        Voluntary Contribution (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        value={contributionAmount === 0 ? "" : contributionAmount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setContributionAmount(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-full h-10 px-3 rounded-lg border border-teal-200 text-xs font-semibold text-teal-950 focus:ring-2 focus:ring-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-teal-800 font-medium mb-1">
                        Payment Mode
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {PAYMENT_MODES.map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setPaymentMode(mode)}
                            className={`py-1.5 text-[11px] font-bold rounded-md border ${
                              paymentMode === mode
                                ? "bg-teal-700 text-white border-teal-700"
                                : "bg-white text-teal-800 border-teal-200"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Check-In Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs font-bold text-teal-900">
                    Total Amount to Collect:{" "}
                    <span className="text-base text-teal-700 font-black">
                      ₹{totalPayment.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 shadow-md shadow-teal-800/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Confirm & Check-In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
