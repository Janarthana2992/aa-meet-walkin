"use client";

import React from "react";
import { PaymentMode } from "@/server/constants";
import { Card, Field, Input, Notice, Segmented, cx, inr } from "@/components/ui";

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

const QUICK_AMOUNTS = [0, 100, 500, 1000];

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
  const total = registrationFee + voluntaryContribution;

  return (
    <Card title="Payment">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-600">Entry fee for the {graduatingYear} batch</span>
          <span className="text-stone-900">{registrationFee > 0 ? inr(registrationFee) : "None"}</span>
        </div>

        <Field group label="Contribution (optional)" hint="Goes to scholarships and association activities.">
          <div className="flex flex-wrap gap-2 mb-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                aria-pressed={voluntaryContribution === amt}
                onClick={() => onContributionChange(amt)}
                className={cx(
                  "h-9 px-3 rounded-md border text-sm",
                  voluntaryContribution === amt
                    ? "bg-teal-800 border-teal-800 text-white"
                    : "bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
                )}
              >
                {amt === 0 ? "None" : inr(amt)}
              </button>
            ))}
          </div>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            aria-label="Other contribution amount"
            placeholder="Other amount"
            value={voluntaryContribution === 0 ? "" : voluntaryContribution}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onContributionChange(isNaN(val) ? 0 : Math.max(0, val));
            }}
          />
        </Field>

        <div className="flex items-center justify-between pt-3 border-t border-stone-200">
          <span className="font-medium text-stone-900">Total</span>
          <span className="text-lg font-semibold text-stone-900 tabular-nums">
            {total > 0 ? inr(total) : "Nothing to pay"}
          </span>
        </div>

        {total > 0 && (
          <div className="space-y-3">
            <Segmented
              label="Payment method"
              value={paymentMode}
              onChange={onPaymentModeChange}
              options={[
                { value: "ONLINE", label: "UPI" },
                { value: "CASH", label: "Cash" },
              ]}
            />
            {paymentMode === "ONLINE" ? (
              <>
                <p className="text-sm text-stone-600">
                  Pay {inr(total)} using the QR code at the desk, then enter the last 4 digits of the
                  UPI reference number.
                </p>
                <Field label="Last 4 digits of UPI reference">
                  <Input
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={utrLast4}
                    onChange={(e) => onUtrChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="font-mono tracking-[0.3em]"
                  />
                </Field>
              </>
            ) : (
              <Notice tone="info">Pay {inr(total)} in cash at the desk.</Notice>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
