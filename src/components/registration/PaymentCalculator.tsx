"use client";

import React from "react";
import {
  IndianRupee,
  QrCode,
  Banknote,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { PAYMENT_MODES, PaymentMode } from "@/server/constants";

interface PaymentCalculatorProps {
  graduatingYear: number;
  registrationFee: number;
  voluntaryContribution: number;
  paymentMode: PaymentMode;
  utrLast4: string;
  onContributionChange: (amount: number) => void;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onUtrChange: (utr: string) => void;
}

export function PaymentCalculator({
  graduatingYear,
  registrationFee,
  voluntaryContribution,
  paymentMode,
  utrLast4,
  onContributionChange,
  onPaymentModeChange,
  onUtrChange,
}: PaymentCalculatorProps) {
  const totalAmount =
    (Number(registrationFee) || 0) + (Number(voluntaryContribution) || 0);
  const paymentRequired = totalAmount > 0;

  return (
    <div className="space-y-5">
      {/* Fee & Contribution Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* System-filled Registration Fee Box */}
        <div>
          <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Registration Fee (Batch {graduatingYear})</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" />
              Auto-Filled
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-700">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              type="text"
              readOnly
              value={
                registrationFee === 0
                  ? "0 (Free Entry)"
                  : `${registrationFee.toLocaleString("en-IN")}`
              }
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 bg-teal-50/70 text-teal-950 font-extrabold text-sm cursor-not-allowed outline-none"
            />
          </div>
          <p className="text-[11px] text-teal-700/80 mt-1.5">
            Set automatically by event batch tier rules
          </p>
        </div>

        {/* Voluntary Contribution Box (Optional) */}
        <div>
          <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Voluntary Contribution (₹)</span>
            <span className="text-[10px] font-semibold text-teal-600/80 normal-case">
              Optional
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="50"
              placeholder="0"
              value={voluntaryContribution === 0 ? "" : voluntaryContribution}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onContributionChange(isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm"
            />
          </div>
          <p className="text-[11px] text-teal-700/80 mt-1.5">
            Optional support for student scholarships & IRTTAA activities
          </p>
        </div>
      </div>

      {/* Total Payable Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-lg shadow-teal-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-teal-100 block">
            Total Payable Amount
          </span>
          <div className="text-3xl font-black tracking-tight mt-0.5">
            ₹{totalAmount.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="text-xs text-teal-100 font-medium space-y-0.5 sm:text-right">
          <div>
            Registration Fee: ₹{registrationFee.toLocaleString("en-IN")}
          </div>
          <div>
            Voluntary Contribution: ₹
            {voluntaryContribution.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Payment Instructions & UTR / Cash Selection */}
      {paymentRequired ? (
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-950">
                Kindly do the payment using QR code on the table then Submit it.
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Scan the IRTTAA QR code at the registration desk for{" "}
                <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>, or pay
                via Cash at the counter.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-2">
                Payment Mode *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_MODES.map((mode) => {
                  const selected = paymentMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onPaymentModeChange(mode)}
                      className={`h-11 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selected
                          ? "bg-teal-700 text-white border-teal-700 shadow-md"
                          : "bg-white text-teal-900 border-amber-200 hover:bg-amber-100/50"
                      }`}
                    >
                      {mode === "ONLINE" ? (
                        <QrCode className="w-4 h-4" />
                      ) : (
                        <Banknote className="w-4 h-4" />
                      )}
                      <span>
                        {mode === "ONLINE" ? "Online (QR / UPI)" : "Cash"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMode === "ONLINE" && (
              <div>
                <label className="block text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-2">
                  Last 4 Digits of UPI / UTR Reference *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  placeholder="e.g. 4821"
                  value={utrLast4}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
                    onUtrChange(digitsOnly);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-amber-300 bg-white text-teal-950 font-mono font-black text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
            Free Entry applies to your batch! No payment required — simply click Submit below to check in.
          </span>
        </div>
      )}
    </div>
  );
}
