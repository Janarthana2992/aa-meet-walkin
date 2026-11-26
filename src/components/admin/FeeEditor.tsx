"use client";

/**
 * Entry fee editor.
 *
 * Fees are organised in groups. Each group applies to one or more member
 * types (multi-select) and has its own list of "from batch → fee" rows.
 * Every member type belongs to exactly one group, so there is never a gap or
 * a conflict. Saved as per-type rules in event_fee_configurations.
 */
import React, { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { EventFeeConfiguration } from "@/types/database.types";
import {
  FIRST_BATCH_YEAR,
  REGISTRATION_MEMBERSHIP_TYPES,
  RegistrationMembershipType,
} from "@/server/constants";
import { Button, Card, Input, Notice, Spinner, api, cx, inr } from "@/components/ui";

type Row = { from: number; fee: number };
type Group = { id: number; types: RegistrationMembershipType[]; rows: Row[] };

const OPEN_END = 2100; // last row covers every later batch

const TYPE_LABELS: Record<RegistrationMembershipType, string> = {
  PATRON_MEMBER: "Patron",
  LIFE_MEMBER: "Life",
  REGISTERED_MEMBER: "Registered",
  UNREGISTERED_MEMBER: "Not a member",
};

let nextId = 1;
const newId = () => nextId++;

const DEFAULT_ROWS: Row[] = [
  { from: FIRST_BATCH_YEAR, fee: 500 },
  { from: 2001, fee: 400 },
  { from: 2011, fee: 300 },
  { from: 2021, fee: 0 },
];

/** Turn stored per-type rules into groups of types that share the same rows. */
function groupsFromRules(rules: EventFeeConfiguration[]): Group[] {
  const rowsByType = new Map<RegistrationMembershipType, Row[]>();
  for (const type of REGISTRATION_MEMBERSHIP_TYPES) {
    const rows = rules
      .filter((r) => r.is_active && r.membership_type === type)
      .sort((a, b) => a.min_graduating_year - b.min_graduating_year)
      .map((r) => ({ from: r.min_graduating_year, fee: Number(r.registration_fee) || 0 }));
    if (rows.length) rows[0].from = FIRST_BATCH_YEAR;
    rowsByType.set(type, rows);
  }
  // Types with no rules of their own fall back to the first type that has rules
  const fallback = [...rowsByType.values()].find((r) => r.length) || DEFAULT_ROWS;

  const groups: Group[] = [];
  for (const type of REGISTRATION_MEMBERSHIP_TYPES) {
    const rows = rowsByType.get(type)!.length ? rowsByType.get(type)! : fallback;
    const key = JSON.stringify(rows);
    const existing = groups.find((g) => JSON.stringify(g.rows) === key);
    if (existing) existing.types.push(type);
    else groups.push({ id: newId(), types: [type], rows: rows.map((r) => ({ ...r })) });
  }
  return groups;
}

function rangeLabel(rows: Row[], i: number) {
  const next = rows[i + 1];
  return next ? `${rows[i].from} – ${next.from - 1}` : `${rows[i].from} onwards`;
}

function TypePicker({
  selected,
  onToggle,
}: {
  selected: RegistrationMembershipType[];
  onToggle: (type: RegistrationMembershipType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Member types">
      {REGISTRATION_MEMBERSHIP_TYPES.map((type) => {
        const on = selected.includes(type);
        return (
          <button
            key={type}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onToggle(type)}
            className={cx(
              "h-9 pl-2.5 pr-3 rounded-full border text-sm font-medium inline-flex items-center gap-1.5 transition-colors",
              on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-muted hover:text-ink"
            )}
          >
            <span
              className={cx(
                "w-4 h-4 rounded flex items-center justify-center border",
                on ? "bg-brand-600 border-brand-600 text-white" : "border-line bg-white"
              )}
            >
              {on && <Check className="w-3 h-3" />}
            </span>
            {TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}

function BatchRows({
  rows,
  onChange,
}: {
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const update = (idx: number, patch: Partial<Row>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  return (
    <>
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((r, idx) => (
          <li key={idx} className="py-3 flex items-end gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink">Batch {rangeLabel(rows, idx)}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="block text-xs text-muted mb-1">From batch</span>
                  {idx === 0 ? (
                    <div className="h-12 px-3.5 flex items-center rounded-lg bg-canvas border border-line text-muted">
                      {FIRST_BATCH_YEAR}
                    </div>
                  ) : (
                    <Input type="number" inputMode="numeric" value={r.from} onChange={(e) => update(idx, { from: Number(e.target.value) })} />
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
                aria-label={`Remove batch ${rangeLabel(rows, idx)}`}
                className="w-11 px-0 text-muted"
                onClick={() => onChange(rows.filter((_, i) => i !== idx))}
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
          const last = rows[rows.length - 1];
          onChange([...rows, { from: (last?.from ?? FIRST_BATCH_YEAR) + 10, fee: 0 }]);
        }}
      >
        <Plus className="w-4 h-4" /> Add batch range
      </Button>
    </>
  );
}

export function FeeEditor({ eventId }: { eventId: number }) {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<{ data: EventFeeConfiguration[] }>(`/api/admin/events/${eventId}/fees`)
      .then((res) => !cancelled && setGroups(groupsFromRules(res.data)))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const change = (next: Group[]) => {
    setSaved(false);
    setError(null);
    setGroups(next);
  };

  /** Selecting a type in one group moves it out of every other group. */
  const toggleType = (groupId: number, type: RegistrationMembershipType) => {
    if (!groups) return;
    const group = groups.find((g) => g.id === groupId)!;
    if (group.types.includes(type)) {
      if (groups.length === 1) {
        setError("With a single fee list it must cover every member type. Add a separate fee list instead.");
        return;
      }
      // Removing a type from a group hands it to the first other group
      const target = groups.find((g) => g.id !== groupId)!;
      change(
        groups
          .map((g) =>
            g.id === groupId
              ? { ...g, types: g.types.filter((t) => t !== type) }
              : g.id === target.id
                ? { ...g, types: [...g.types, type] }
                : g
          )
          .filter((g) => g.types.length > 0)
      );
    } else {
      change(
        groups
          .map((g) =>
            g.id === groupId ? { ...g, types: [...g.types, type] } : { ...g, types: g.types.filter((t) => t !== type) }
          )
          .filter((g) => g.types.length > 0)
      );
    }
  };

  const addGroup = () => {
    if (!groups) return;
    const first = groups[0];
    // Start the new list with the first group's rows and one type taken from it
    const take = first.types.find((t) => t !== "UNREGISTERED_MEMBER") || first.types[first.types.length - 1];
    if (!take || first.types.length < 2) {
      setError("Every member type already has its own fee list.");
      return;
    }
    change([
      ...groups.map((g) => (g.id === first.id ? { ...g, types: g.types.filter((t) => t !== take) } : g)),
      { id: newId(), types: [take], rows: first.rows.map((r) => ({ ...r })) },
    ]);
  };

  const save = async () => {
    if (!groups) return;
    for (const g of groups) {
      const sorted = g.rows.slice().sort((a, b) => a.from - b.from);
      for (let i = 1; i < sorted.length; i++) {
        if (!sorted[i].from || sorted[i].from <= sorted[i - 1].from) {
          setError(`Fee list for ${g.types.map((t) => TYPE_LABELS[t]).join(", ")}: each row must start at a later batch than the one above.`);
          return;
        }
      }
    }
    setSaving(true);
    setError(null);
    try {
      const rules = groups.flatMap((g) => {
        const rows = g.rows.slice().sort((a, b) => a.from - b.from);
        return g.types.flatMap((membershipType) =>
          rows.map((r, i) => ({
            minGraduatingYear: r.from,
            maxGraduatingYear: rows[i + 1] ? rows[i + 1].from - 1 : OPEN_END,
            membershipType,
            registrationFee: Number(r.fee) || 0,
            displayOrder: i + 1,
            isActive: true,
          }))
        );
      });
      await api(`/api/admin/events/${eventId}/fees`, { method: "PUT", json: { rules } });
      setGroups(groups.map((g) => ({ ...g, rows: g.rows.slice().sort((a, b) => a.from - b.from) })));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save fees.");
    } finally {
      setSaving(false);
    }
  };

  if (!groups) return error ? <Notice tone="error">{error}</Notice> : <Spinner />;

  const single = groups.length === 1;

  return (
    <div className="space-y-4">
      {groups.map((g, gi) => (
        <Card
          key={g.id}
          title={single ? "Entry fee" : `Fee list ${gi + 1}`}
          description={single ? "Same fee for every member type. Set the fee by batch year; 0 means free." : "Applies to the member types ticked below."}
          action={
            !single ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted"
                onClick={() => {
                  // Merge this list's types into the first other list
                  const target = groups.find((x) => x.id !== g.id)!;
                  change(
                    groups
                      .filter((x) => x.id !== g.id)
                      .map((x) => (x.id === target.id ? { ...x, types: [...x.types, ...g.types] } : x))
                  );
                }}
              >
                Remove list
              </Button>
            ) : undefined
          }
        >
          <div className="mb-4">
            <div className="text-sm font-medium text-ink/80 mb-2">Member types</div>
            <TypePicker selected={g.types} onToggle={(t) => toggleType(g.id, t)} />
          </div>
          <BatchRows rows={g.rows} onChange={(rows) => change(groups.map((x) => (x.id === g.id ? { ...x, rows } : x)))} />
        </Card>
      ))}

      {groups.length < REGISTRATION_MEMBERSHIP_TYPES.length && (
        <Button variant="secondary" className="w-full" onClick={addGroup}>
          <Plus className="w-4 h-4" />
          Add a separate fee for some member types
        </Button>
      )}

      <Card title="Summary">
        <div className="space-y-3 text-sm">
          {groups.map((g) => {
            const rows = g.rows.slice().sort((a, b) => a.from - b.from);
            return (
              <div key={g.id}>
                <div className="font-medium text-ink">{g.types.map((t) => TYPE_LABELS[t]).join(", ")}</div>
                {rows.map((r, i) => (
                  <div key={i} className="flex justify-between text-muted">
                    <span>Batch {rangeLabel(rows, i)}</span>
                    <span className="text-ink tabular-nums">{r.fee > 0 ? inr(r.fee) : "Free"}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-3">
          {error && <Notice tone="error">{error}</Notice>}
          {saved && <Notice tone="success">Fees saved.</Notice>}
          <Button onClick={save} loading={saving} className="w-full sm:w-auto">
            Save fees
          </Button>
        </div>
      </Card>
    </div>
  );
}
