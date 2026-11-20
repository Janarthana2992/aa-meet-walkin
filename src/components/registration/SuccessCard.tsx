"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  Building2,
  CreditCard,
  UserCheck,
  RotateCcw,
  Printer,
  Sparkles,
} from "lucide-react";
import { Attendee } from "@/types/database.types";

interface SuccessCardProps {
  attendee: Attendee;
  onReset: () => void;
}

export function SuccessCard({ attendee, onReset }: SuccessCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-teal-700/25 mb-4"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Walk-In Registration & Check-In Complete</span>
        </span>
        <h2 className="text-3xl font-black text-teal-950">
          Welcome, {attendee.name}!
        </h2>
        <p className="text-sm text-teal-800/80 mt-1">
          You are officially checked in to the Alumni Meet.
        </p>
      </div>

      {/* Official Digital Attendee Badge Card */}
      <div className="p-8 rounded-3xl bg-white shadow-2xl shadow-teal-950/10 border-2 border-teal-200 relative overflow-hidden print:shadow-none print:border-black">
        {/* Top Decorative Header */}
        <div className="flex items-center justify-between pb-6 border-b border-teal-100">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-teal-200/80 bg-white flex items-center justify-center p-0.5">
              <Image
                src="/logo.png"
                alt="IRTTAA Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="font-extrabold text-teal-950 text-base leading-tight">
                IRTTAA NuzhAI
              </h4>
              <p className="text-xs text-teal-700/80 font-medium">
                Institute of Road and Transport Technology
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <UserCheck className="w-4 h-4" />
            <span>Checked In</span>
          </div>
        </div>

        {/* Badge Center Details */}
        <div className="py-6 space-y-4">
          <div>
            <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-widest">
              Attendee ID
            </span>
            <div className="text-2xl font-mono font-black text-teal-900 tracking-wide mt-0.5">
              {attendee.attendee_id}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-wider">
                Full Name
              </span>
              <p className="text-base font-bold text-teal-950 mt-0.5">
                {attendee.name}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-wider">
                Batch & Stream
              </span>
              <p className="text-base font-bold text-teal-950 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600 inline" />
                <span>{attendee.batch_year} • {attendee.stream}</span>
              </p>
            </div>
          </div>

          {attendee.company && (
            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-wider">
                Company / Organization
              </span>
              <p className="text-sm font-semibold text-teal-900 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600 inline" />
                <span>{attendee.company}</span>
              </p>
            </div>
          )}

          {/* Payment Receipts Breakdown */}
          <div className="pt-4 border-t border-teal-100 grid grid-cols-3 gap-3 bg-teal-50/60 p-4 rounded-2xl">
            <div>
              <span className="text-[10px] font-bold text-teal-700/80 uppercase">
                Membership
              </span>
              <p className="text-sm font-black text-teal-950">
                ₹{Number(attendee.membership_amount || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-700/80 uppercase">
                Contribution
              </span>
              <p className="text-sm font-black text-teal-950">
                ₹{Number(attendee.contribution_amount || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-700/80 uppercase">
                Total Paid ({attendee.payment_mode})
              </span>
              <p className="text-base font-black text-emerald-700">
                ₹{Number(attendee.amount_paid || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Check-In Timestamp */}
        <div className="pt-4 border-t border-teal-100 flex items-center justify-between text-xs text-teal-700/80 font-medium">
          <span>Mobile: {attendee.mobile}</span>
          <span>
            {attendee.checked_in_at
              ? new Date(attendee.checked_in_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Checked In"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl font-bold text-sm text-teal-950 bg-white hover:bg-teal-50 border border-teal-200 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4 text-teal-700" />
          <span>Print / Save Badge</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-800/25"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Register Another Alumni</span>
        </button>
      </div>
    </motion.div>
  );
}
