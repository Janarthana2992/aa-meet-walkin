"use client";

import React from "react";
import Image from "next/image";
import { EventRegistration } from "@/types/database.types";
import { Button, inr, passNumber } from "@/components/ui";

interface SuccessCardProps {
  registration: EventRegistration;
  eventName?: string;
  onReset: () => void;
}

export function SuccessCard({ registration: r, eventName, onReset }: SuccessCardProps) {
  const guests = r.accompanying_family_count + r.accompanying_alumni_count;

  const rows: [string, string][] = [
    ["Name", r.full_name],
    ["Batch", [r.graduating_year, r.stream].filter(Boolean).join(", ") || "—"],
    ["Food", r.food_preference || "—"],
    ["Guests", guests > 0 ? String(guests) : "None"],
    [
      "Payment",
      r.payment_required
        ? `${inr(r.total_amount)} by ${r.payment_mode === "ONLINE" ? `UPI${r.utr_last4 ? ` (ref. ending ${r.utr_last4})` : ""}` : "cash"}`
        : "No entry fee",
    ],
  ];

  return (
    <div className="space-y-4">
      <div className="no-print">
        <h1 className="text-xl font-semibold text-stone-900">Checked in</h1>
        <p className="text-stone-600">Show this pass at the registration desk.</p>
      </div>

      <div className="bg-white rounded-lg border border-stone-300">
        <div className="px-4 py-3 border-b border-stone-200 flex items-center gap-3">
          <Image src="/logo.png" alt="" width={32} height={32} />
          <div className="min-w-0">
            <div className="font-medium text-stone-900 truncate">{eventName || "IRTTAA event"}</div>
            <div className="text-xs text-stone-500">Event pass</div>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="text-xs text-stone-500">Pass number</div>
          <div className="text-2xl font-mono font-semibold text-stone-900 tracking-wide">
            {passNumber(r.registration_id)}
          </div>
          <dl className="mt-4 divide-y divide-stone-100 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-stone-500">{k}</dt>
                <dd className="text-stone-900 text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 no-print">
        <Button variant="secondary" onClick={() => window.print()}>
          Print pass
        </Button>
        <Button onClick={onReset}>Next person</Button>
      </div>
    </div>
  );
}
