"use client";

import React from "react";
import { MEMBERSHIP_OPTIONS, PAYMENT_MODES, PaymentMode } from "@/server/constants";
import { IndianRupee, CreditCard, ShieldCheck } from "lucide-react";

interface PaymentCalculatorProps {
  membershipType: string;
  membershipAmount: number;
  contributionAmount: number;
  paymentMode: PaymentMode;
  onMembershipChange: (type: string, amount: number) => void;
  onContributionChange: (amount: number) => void;
  onPaymentModeChange: (mode: PaymentMode) => void;
}

export function PaymentCalculator({
  membershipType,
  membershipAmount,
  contributionAmount,
  paymentMode,
  onMembershipChange,
  onContributionChange,
  onPaymentModeChange,
}: PaymentCalculatorProps) {
  const totalAmount = membershipAmount + contributionAmount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Membership Tier Selector */}
        <div>
          <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
            Membership Plan
          </label>
          <select
            value={membershipType}
            onChange={(e) => {
              const selected = MEMBERSHIP_OPTIONS.find(
                (opt) => opt.value === e.target.value
              );
              onMembershipChange(
                e.target.value,
                selected ? selected.amount : 0
              );
            }}
            className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
          >
            {MEMBERSHIP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-teal-700/70 mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Alumni Association membership subscription</span>
          </p>
        </div>

        {/* Voluntary Contribution Input */}
        <div>
          <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
            Voluntary Contribution (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={contributionAmount === 0 ? "" : contributionAmount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onContributionChange(isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <p className="text-xs text-teal-700/70 mt-1.5">
            Voluntary donation towards student scholarship & chapter events
          </p>
        </div>
      </div>

      {/* Payment Mode & Total Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-teal-100/60 border border-teal-200/80">
        <div>
          <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-teal-700" />
            <span>Payment Mode</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onPaymentModeChange(mode)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                  paymentMode === mode
                    ? "bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-800/20"
                    : "bg-white text-teal-900 border-teal-200 hover:bg-teal-50"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Live Total Badge */}
        <div className="flex flex-col items-start md:items-end justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Total Collection
          </span>
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-teal-600 mt-0.5">
            ₹{totalAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-teal-700/80 font-medium">
            (Membership: ₹{membershipAmount} + Contribution: ₹{contributionAmount})
          </div>
        </div>
      </div>
    </div>
  );
}
