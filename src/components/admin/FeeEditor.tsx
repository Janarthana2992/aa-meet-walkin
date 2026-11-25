"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EventFeeConfiguration } from "@/types/database.types";
import {
  LATEST_BATCH_YEAR,
  MEMBERSHIP_DISPLAY_LABELS,
  REGISTRATION_MEMBERSHIP_TYPES,
  RegistrationMembershipType,
} from "@/server/constants";
import { Button, Card, Field, Input, Notice, Select, Spinner, api } from "@/components/ui";

type Tier = { min: number; max: number; fee: number };

/** Batch tiers if every membership type has the same active fees, else null. */
function uniformTiers(rules: EventFeeConfiguration[]): Tier[] | null {
  if (rules.length === 0) return [];
  if (rules.some((r) => !r.is_active)) return null;
  const sig = (type: string) =>
    rules
      .filter((r) => r.membership_type === type)
      .map((r) => ({ min: r.min_graduating_year, max: r.max_graduating_year, fee: Number(r.registration_fee) || 0 }))
      .sort((a, b) => a.min - b.min);
  const base = sig(REGISTRATION_MEMBERSHIP_TYPES[0]);
  return REGISTRATION_MEMBERSHIP_TYPES.every((t) => JSON.stringify(sig(t)) === JSON.stringify(base))
    ? base
    : null;
}

/**
 * Entry fee editor. Simple mode: one fee per batch range for everyone.
 * Detailed mode: separate rules per membership type.
 */
export function FeeEditor({ eventId }: { eventId: number }) {
  const [rules, setRules] = useState<EventFeeConfiguration[] | null>(null);
  const [simple, setSimple] = useState(true);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<{ data: EventFeeConfiguration[] }>(`/api/admin/events/${eventId}/fees`)
      .then((res) => {
        if (cancelled) return;
        setRules(res.data);
        const uniform = uniformTiers(res.data);
        setSimple(Boolean(uniform));
        setTiers(uniform || []);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const expand = (list: Tier[]): EventFeeConfiguration[] =>
    REGISTRATION_MEMBERSHIP_TYPES.flatMap((membership, m) =>
      list.map((t, i) => ({
        fee_configuration_id: -(m * 100 + i + 1),
        event_id: eventId,
        min_graduating_year: t.min,
        max_graduating_year: t.max,
        membership_type: membership,
        registration_fee: t.fee,
        display_order: i + 1,
        is_active: true,
        created_at: "",
        updated_at: "",
      }))
    );

  const touch = () => setSaved(false);
  const updateTier = (idx: number, patch: Partial<Tier>) => {
    touch();
    setTiers((ts) => ts.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };
  const updateRule = (idx: number, patch: Partial<EventFeeConfiguration>) => {
    touch();
    setRules((rs) => rs && rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const save = async () => {
    const finalRules = simple ? expand(tiers) : rules || [];
    if (finalRules.some((r) => !r.min_graduating_year || !r.max_graduating_year || r.min_graduating_year > r.max_graduating_year)) {
      setError("Check the batch years. The first year must not be after the last year.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api<{ data: EventFeeConfiguration[] }>(`/api/admin/events/${eventId}/fees`, {
        method: "PUT",
        json: {
          rules: finalRules.map((r, i) => ({
            minGraduatingYear: r.min_graduating_year,
            maxGraduatingYear: r.max_graduating_year,
            membershipType: r.membership_type,
            registrationFee: Number(r.registration_fee) || 0,
            displayOrder: i + 1,
            isActive: r.is_active,
          })),
        },
      });
      setRules(res.data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save fees.");
    } finally {
      setSaving(false);
    }
  };

  if (!rules) return error ? <Notice tone="error">{error}</Notice> : <Spinner />;

  const order = REGISTRATION_MEMBERSHIP_TYPES as readonly string[];
  const sorted = rules
    .map((r, idx) => ({ r, idx }))
    .sort(
      (a, b) =>
        order.indexOf(a.r.membership_type) - order.indexOf(b.r.membership_type) ||
        a.r.min_graduating_year - b.r.min_graduating_year
    );

  return (
    <Card>
      {simple ? (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            Entry fee by batch year. The same fee applies to members and non-members. Enter 0 for free entry.
          </p>
          <div className="grid grid-cols-[1fr_1fr_1fr_2.75rem] gap-2 text-sm font-medium text-stone-700">
            <span>First batch</span>
            <span>Last batch</span>
            <span>Fee (₹)</span>
            <span />
          </div>
          {tiers.map((t, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_2.75rem] gap-2">
              <Input aria-label="First batch" type="number" inputMode="numeric" value={t.min} onChange={(e) => updateTier(idx, { min: Number(e.target.value) })} />
              <Input aria-label="Last batch" type="number" inputMode="numeric" value={t.max} onChange={(e) => updateTier(idx, { max: Number(e.target.value) })} />
              <Input aria-label="Fee" type="number" inputMode="numeric" min={0} value={t.fee} onChange={(e) => updateTier(idx, { fee: Number(e.target.value) || 0 })} />
              <Button variant="ghost" aria-label="Remove row" className="px-0 text-stone-500" onClick={() => { touch(); setTiers((ts) => ts.filter((_, i) => i !== idx)); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                touch();
                setTiers((ts) => {
                  const last = ts[ts.length - 1];
                  return [...ts, { min: last ? Math.min(last.max + 1, LATEST_BATCH_YEAR) : 1988, max: LATEST_BATCH_YEAR, fee: 0 }];
                });
              }}
            >
              <Plus className="w-4 h-4" /> Add row
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRules(expand(tiers));
                setSimple(false);
              }}
            >
              Set different fees by membership
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            A rule for the person&apos;s membership type and batch is used first. If none matches, any rule
            covering their batch is used.
          </p>
          <ul className="divide-y divide-stone-200 border-y border-stone-200">
            {sorted.map(({ r, idx }) => (
              <li key={r.fee_configuration_id} className="py-3 space-y-2">
                <div className="flex gap-2">
                  <Select aria-label="Membership" value={r.membership_type} className="flex-1" onChange={(e) => updateRule(idx, { membership_type: e.target.value as RegistrationMembershipType })}>
                    {REGISTRATION_MEMBERSHIP_TYPES.map((t) => (
                      <option key={t} value={t}>{MEMBERSHIP_DISPLAY_LABELS[t]}</option>
                    ))}
                  </Select>
                  <Button variant="ghost" aria-label="Remove rule" className="w-11 px-0 text-stone-500" onClick={() => { touch(); setRules((rs) => rs && rs.filter((_, i) => i !== idx)); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="First batch">
                    <Input type="number" inputMode="numeric" value={r.min_graduating_year} onChange={(e) => updateRule(idx, { min_graduating_year: Number(e.target.value) })} />
                  </Field>
                  <Field label="Last batch">
                    <Input type="number" inputMode="numeric" value={r.max_graduating_year} onChange={(e) => updateRule(idx, { max_graduating_year: Number(e.target.value) })} />
                  </Field>
                  <Field label="Fee (₹)">
                    <Input type="number" inputMode="numeric" min={0} value={r.registration_fee} onChange={(e) => updateRule(idx, { registration_fee: Number(e.target.value) || 0 })} />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-700">
                  <input type="checkbox" checked={r.is_active} onChange={(e) => updateRule(idx, { is_active: e.target.checked })} className="w-4 h-4 accent-teal-800" />
                  Rule in use
                </label>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              touch();
              setRules((rs) => [
                ...(rs || []),
                {
                  fee_configuration_id: -Date.now(),
                  event_id: eventId,
                  min_graduating_year: 1988,
                  max_graduating_year: LATEST_BATCH_YEAR,
                  membership_type: "UNREGISTERED_MEMBER",
                  registration_fee: 0,
                  display_order: (rs?.length ?? 0) + 1,
                  is_active: true,
                  created_at: "",
                  updated_at: "",
                } as EventFeeConfiguration,
              ]);
            }}
          >
            <Plus className="w-4 h-4" /> Add rule
          </Button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
        {error && <Notice tone="error">{error}</Notice>}
        {saved && <Notice tone="success">Fees saved.</Notice>}
        <Button onClick={save} loading={saving} className="w-full sm:w-auto">
          Save fees
        </Button>
      </div>
    </Card>
  );
}
