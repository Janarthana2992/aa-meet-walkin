"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  UserCheck,
  RotateCcw,
  Printer,
  Sparkles,
} from "lucide-react";
import { EventRegistration } from "@/types/database.types";

interface SuccessCardProps {
  registration: EventRegistration;
  eventName?: string;
  onReset: () => void;
}

export function SuccessCard({
  registration,
  eventName,
  onReset,
}: SuccessCardProps) {
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
      <div className="text-center mb-8 print:hidden">
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
          <span>Event Registration & Check-In Complete</span>
        </span>
        <h2 className="text-3xl font-black text-teal-950">
          Welcome, {registration.full_name}!
        </h2>
        <p className="text-sm text-teal-800/80 mt-1">
          You are officially checked in{eventName ? ` for ${eventName}` : ""}.
        </p>
      </div>

      {/* Official Digital Attendee Badge Card */}
      <div className="p-8 rounded-3xl bg-white shadow-2xl shadow-teal-950/10 border-2 border-teal-200 relative overflow-hidden print:shadow-none print:border-black">
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
                {eventName || "IRTTAA NuzhAI"}
              </h4>
              <p className="text-xs text-teal-700/80 font-medium">
                Institute of Road and Transport Technology Alumni Association
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
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-widest">
                Pass Number
              </span>
              <div className="text-2xl font-mono font-black text-teal-900 tracking-wide mt-0.5">
                IRTTAA-{String(registration.registration_id).padStart(4, "0")}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                registration.registration_source === "PRE_REGISTERED"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {registration.registration_source === "PRE_REGISTERED"
                ? "Pre-Registered"
                : "On-Spot Walk-In"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-wider block">
                Full Name
              </span>
              <div className="font-bold text-teal-950">
                {registration.full_name}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-wider block">
                Batch & Stream
              </span>
              <div className="font-bold text-teal-950">
                {registration.graduating_year || "—"} •{" "}
                {registration.course || ""} {registration.stream || ""}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-wider block">
                Email / Mobile
              </span>
              <div className="font-semibold text-teal-900 text-xs">
                {registration.email}
                {registration.mobile && (
                  <span className="block font-mono">{registration.mobile}</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-teal-700/70 uppercase tracking-wider block">
                Food & Accompanying
              </span>
              <div className="font-semibold text-teal-900 text-xs">
                {registration.food_preference || "Vegetarian"} • Family:{" "}
                {registration.accompanying_family_count} • Alumni:{" "}
                {registration.accompanying_alumni_count}
              </div>
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="mt-4 p-4 rounded-2xl bg-teal-50/80 border border-teal-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-teal-700 font-semibold block">
                Total Paid ({registration.payment_required ? registration.payment_mode : "Free Entry"})
              </span>
              <span className="text-lg font-black text-teal-950">
                ₹{Number(registration.total_amount).toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-teal-700/80 ml-2">
                (Fee: ₹{registration.registration_fee} + Contribution: ₹
                {registration.voluntary_contribution})
              </span>
            </div>
            {registration.utr_last4 && (
              <div className="px-3 py-1 rounded-lg bg-white border border-teal-200 font-mono font-bold text-teal-900">
                UTR Ref: ****{registration.utr_last4}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-3.5 rounded-2xl bg-white hover:bg-teal-50 border border-teal-200 text-teal-950 font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-teal-700" />
          <span>Print Event Pass</span>
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-800/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Register Next Alumnus</span>
        </button>
      </div>
    </motion.div>
  );
}
