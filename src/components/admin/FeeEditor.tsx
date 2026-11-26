"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EventFeeConfiguration } from "@/types/database.types";
import { FIRST_BATCH_YEAR, REGISTRATION_MEMBERSHIP_TYPES } from "@/server/constants";
import { Button, Card, Input, Notice, Spinner, api, inr } from "@/components/ui";

/** Each row: batches from `from` up to the next row's start pay `fee`. */
type Row = { from: number; fee: number };

const OPEN_END = 2100; // last row covers every later batch

function rowsFromRules(rules: EventFeeConfiguration[]): { rows: Row[]; mixed: boolean } {
  const active = rules.filter((r) => r.is_active);
  const byStart = new Map<number, number[]>();
  for (const r of active) {
    byStart.set(r.min_graduating_year, [...(byStart.get(r.min_graduating_year) || []), Number(r.registration_fee) || 0]);
  }
  const rows = [...byStart.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([from, fees]) => ({ from, fee: Math.max(...fees) }));
  const mixed = [...byStart.values()].some((fees) => new Set(fees).size > 1);
  if (rows.length > 0) rows[0].from = FIRST_BATCH_YEAR;
  return { rows, mixed };
}

function rangeLabel(rows: Row[], i: number) {
  const next = rows[i + 1];
  return next ? `${rows[i].from} – ${next.from - 1}` : `${rows[i].from} onwards`;
}

export function FeeEditor({ eventId }: { eventId: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mixed, setMixed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<{ data: EventFeeConfiguration[] }>(`/api/admin/events/${eventId}/fees`)
      .then((res) => {
        if (cancelled) return;
        const parsed = rowsFromRules(res.data);
        setRows(parsed.rows.length ? parsed.rows : [{ from: FIRST_BATCH_YEAR, fee: 0 }]);
        setMixed(parsed.mixed);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const update = (idx: number, patch: Partial<Row>) => {
    setSaved(false);
    setRows((rs) => rs && rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const sorted = (rows || []).slice();

  const save = async () => {
    if (!rows) return;
    const list = rows.slice().sort((a, b) => a.from - b.from);
    for (let i = 1; i < list.length; i++) {
      if (!list[i].from || list[i].from <= list[i - 1].from) {
        setError("Each row must start at a later batch than the row above it.");
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const rules = REGISTRATION_MEMBERSHIP_TYPES.flatMap((membershipType) =>
        list.map((r, i) => ({
          minGraduatingYear: r.from,
          maxGraduatingYear: list[i + 1] ? list[i + 1].from - 1 : OPEN_END,
          membershipType,
          registrationFee: Number(r.fee) || 0,
          displayOrder: i + 1,
          isActive: true,
        }))
      );
      await api(`/api/admin/events/${eventId}/fees`, { method: "PUT", json: { rules } });
      setRows(list);
      setMixed(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save fees.");
    } finally {
      setSaving(false);
    }
  };

  if (!rows) return error ? <Notice tone="error">{error}</Notice> : <Spinner />;

  return (
    <Card title="Entry fee" description="Set the fee by batch year. Enter 0 for free entry.">
      {mixed && (
        <Notice tone="warning" className="mb-4">
          This event had different fees for members and non-members. Saving applies one fee per batch to everyone.
        </Notice>
      )}

      <ul className="divide-y divide-line border-y border-line">
        {sorted.map((r, idx) => (
          <li key={idx} className="py-3 flex items-end gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink">Batch {rangeLabel(sorted, idx)}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="block text-xs text-muted mb-1">From batch</span>
                  {idx === 0 ? (
                    <div className="h-12 px-3.5 flex items-center rounded-lg bg-canvas border border-line text-muted">
                      {FIRST_BATCH_YEAR}
                    </div>
                  ) : (
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={r.from}
                      onChange={(e) => update(idx, { from: Number(e.target.value) })}
                    />
                  )}
                </label>
                <label className="block">
                  <span className="block text-xs text-muted mb-1">Fee (₹)</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={r.fee}
                    onChange={(e) => update(idx, { fee: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </label>
              </div>
            </div>
            {idx === 0 ? (
              <span className="w-11 shrink-0" aria-hidden="true" />
            ) : (
              <Button
                variant="ghost"
                aria-label={`Remove batch ${rangeLabel(sorted, idx)}`}
                className="w-11 px-0 text-muted"
                onClick={() => {
                  setSaved(false);
                  setRows((rs) => rs && rs.filter((_, i) => i !== idx));
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={() => {
          setSaved(false);
          setRows((rs) => {
            const list = rs || [];
            const last = list[list.length - 1];
            return [...list, { from: (last?.from ?? FIRST_BATCH_YEAR) + 10, fee: 0 }];
          });
        }}
      >
        <Plus className="w-4 h-4" /> Add batch range
      </Button>

      <div className="mt-5 rounded-lg bg-canvas border border-line p-3 text-sm text-muted">
        <div className="font-medium text-ink mb-1">Summary</div>
        {sorted.map((r, i) => (
          <div key={i} className="flex justify-between">
            <span>Batch {rangeLabel(sorted, i)}</span>
            <span className="text-ink tabular-nums">{r.fee > 0 ? inr(r.fee) : "Free"}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {error && <Notice tone="error">{error}</Notice>}
        {saved && <Notice tone="success">Fees saved.</Notice>}
        <Button onClick={save} loading={saving} className="w-full sm:w-auto">
          Save fees
        </Button>
      </div>
    </Card>
  );
}
