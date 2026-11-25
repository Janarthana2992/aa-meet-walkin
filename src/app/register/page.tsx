"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, Search, UserPlus } from "lucide-react";
import {
  BATCH_YEARS,
  COURSE_TYPES,
  DEFAULT_BATCH_FEE_TIERS,
  FOOD_PREFERENCES,
  PaymentMode,
  RegistrationMembershipType,
  STREAM_TYPES,
} from "@/server/constants";
import {
  Event,
  EventFeeConfiguration,
  EventRegistration,
  VenueLookupResult,
} from "@/types/database.types";
import {
  AppHeader,
  Button,
  Card,
  Empty,
  Steps,
  formatDate,
  Field,
  Input,
  LinkButton,
  Notice,
  Page,
  Segmented,
  Select,
  Spinner,
  Stepper,
  api,
  inr,
} from "@/components/ui";
import { PaymentCalculator } from "@/components/registration/PaymentCalculator";
import { SuccessCard } from "@/components/registration/SuccessCard";

type Step = "find" | "details" | "done";

const FOOD_LABELS: Record<string, string> = {
  Vegetarian: "Veg",
  "Non-Vegetarian": "Non-veg",
  Vegan: "Vegan",
};

const DEFAULT_YEAR = new Date().getFullYear() - 10;

interface FormState {
  memberLoginId: string | null;
  fullName: string;
  email: string;
  mobile: string;
  graduatingYear: number;
  course: string;
  stream: string;
  membershipTypeUsed: RegistrationMembershipType;
  foodPreference: string;
  accompanyingFamilyCount: number;
  accompanyingAlumniCount: number;
}

const EMPTY_FORM: FormState = {
  memberLoginId: null,
  fullName: "",
  email: "",
  mobile: "",
  graduatingYear: DEFAULT_YEAR,
  course: "BE",
  stream: "",
  membershipTypeUsed: "UNREGISTERED_MEMBER",
  foodPreference: "Vegetarian",
  accompanyingFamilyCount: 0,
  accompanyingAlumniCount: 0,
};

function feeFor(
  rules: EventFeeConfiguration[],
  year: number,
  membership: RegistrationMembershipType
): number {
  const active = rules.filter((r) => r.is_active);
  const inRange = (r: EventFeeConfiguration) =>
    year >= r.min_graduating_year && year <= r.max_graduating_year;
  const rule =
    active.find((r) => r.membership_type === membership && inRange(r)) ||
    active.find(inRange);
  if (rule) return Number(rule.registration_fee) || 0;
  const tier = DEFAULT_BATCH_FEE_TIERS.find(
    (t) => year >= t.minGraduatingYear && year <= t.maxGraduatingYear
  );
  return tier ? tier.registrationFee : 0;
}

function RegisterFlow() {
  const searchParams = useSearchParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [feeRules, setFeeRules] = useState<EventFeeConfiguration[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [step, setStep] = useState<Step>("find");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<VenueLookupResult["source"] | null>(null);
  const [findError, setFindError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const [contribution, setContribution] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("ONLINE");
  const [utrLast4, setUtrLast4] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);

  const fee = feeFor(feeRules, form.graduatingYear, form.membershipTypeUsed);
  const total = fee + contribution;

  const lookup = useCallback(async (q: string, eventId?: number) => {
    const text = q.trim();
    if (!text) return;
    setSearching(true);
    setFindError(null);
    try {
      const { data } = await api<{ data: VenueLookupResult }>("/api/venue/lookup", {
        method: "POST",
        json: { query: text, eventId },
      });
      if (data.alreadyRegistered && data.existingRegistration) {
        setRegistration(data.existingRegistration);
        setStep("done");
        return;
      }
      if (data.found && data.prefill) {
        const p = data.prefill;
        setForm({
          memberLoginId: p.member_login_id,
          fullName: p.full_name || "",
          email: p.email || "",
          mobile: p.mobile || "",
          graduatingYear: p.graduating_year || DEFAULT_YEAR,
          course: p.course || "BE",
          stream: p.stream || "",
          membershipTypeUsed: p.membership_type_used,
          foodPreference: p.food_preference || "Vegetarian",
          accompanyingFamilyCount: p.accompanying_family_count || 0,
          accompanyingAlumniCount: p.accompanying_alumni_count || 0,
        });
        setFound(data.source);
      } else {
        setForm({
          ...EMPTY_FORM,
          email: text.includes("@") ? text.toLowerCase() : "",
          mobile: text.includes("@") ? "" : text,
        });
        setFound("NONE");
      }
      setStep("details");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setFindError(err instanceof Error ? err.message : "Could not search. Try again.");
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/events/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.data) return;
        setEvent(json.data);
        setFeeRules(json.feeRules || []);
        const q = searchParams.get("q");
        if (q) {
          setQuery(q);
          lookup(q, json.data.event_id);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoadingEvent(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startOver = () => {
    setStep("find");
    setQuery("");
    setFound(null);
    setFindError(null);
    setForm(EMPTY_FORM);
    setContribution(0);
    setPaymentMode("ONLINE");
    setUtrLast4("");
    setSubmitError(null);
    setRegistration(null);
    window.scrollTo({ top: 0 });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!form.stream) {
      setSubmitError("Please choose your branch.");
      return;
    }
    if (total > 0 && paymentMode === "ONLINE" && !/^[0-9]{4}$/.test(utrLast4)) {
      setSubmitError("Enter the last 4 digits of the UPI reference number.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await api<{ data: EventRegistration }>("/api/register", {
        method: "POST",
        json: {
          eventId: event.event_id,
          ...form,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          registrationSource: found === "PRE_REGISTERED" ? "PRE_REGISTERED" : "ON_SPOT",
          recognizedMember: Boolean(form.memberLoginId),
          voluntaryContribution: contribution,
          paymentMode: total > 0 ? paymentMode : null,
          utrLast4: total > 0 && paymentMode === "ONLINE" ? utrLast4 : null,
        },
      });
      setRegistration(data);
      setStep("done");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Check-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const STEP_LABELS = ["Find you", "Details", "Pass"];
  const stepIndex = step === "find" ? 0 : step === "details" ? 1 : 2;

  const header = (
    <AppHeader title={event?.event_name || "Check in"} subtitle={event ? formatDate(event.event_date) : undefined} back={{ href: "/", label: "Back to event" }} />
  );

  const progress = (
    <div className="pt-1 pb-1">
      <Steps steps={STEP_LABELS} current={stepIndex} />
    </div>
  );

  if (loadingEvent) {
    return (
      <>
        {header}
        <Spinner />
      </>
    );
  }

  if (!event) {
    return (
      <>
        {header}
        <Page>
          <Card>
            <Empty
              icon={CalendarDays}
              title="No event open for check-in"
              action={<LinkButton href="/" variant="secondary">Back to home</LinkButton>}
            >
              Check-in opens on the day of the event.
            </Empty>
          </Card>
        </Page>
      </>
    );
  }

  if (step === "done" && registration) {
    return (
      <>
        {header}
        <Page>
          {progress}
          <SuccessCard registration={registration} event={event} onReset={startOver} />
        </Page>
      </>
    );
  }

  if (step === "find") {
    return (
      <>
        {header}
        <Page>
          {progress}

          <Card>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Find your registration</h1>
            <p className="mt-1 text-[15px] text-muted">
              Enter the email or mobile number you registered with. We&apos;ll fill in the rest.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                lookup(query, event.event_id);
              }}
              className="mt-5 space-y-3"
            >
              <Field label="Email or mobile number">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted absolute left-3.5 top-4 pointer-events-none" />
                  <Input
                    autoFocus
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="name@gmail.com or 98765 43210"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </Field>
              {findError && <Notice tone="error">{findError}</Notice>}
              <Button type="submit" size="lg" className="w-full" loading={searching} disabled={!query.trim()}>
                Continue
                {!searching && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-brand-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink">Didn&apos;t register online?</div>
                <div className="text-sm text-muted">You can still check in here.</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setFound("NONE");
                  setStep("details");
                }}
              >
                Fill in
              </Button>
            </div>
          </Card>
        </Page>
      </>
    );
  }

  // step === "details"
  return (
    <>
      {header}
      <form onSubmit={submit}>
        <Page className="pb-32">
          {progress}

          {found === "PRE_REGISTERED" && (
            <Notice tone="success">We found your registration. Check the details below.</Notice>
          )}
          {found === "ASSOCIATION_MEMBER" && (
            <Notice tone="success">You&apos;re on the members list. Check the details below.</Notice>
          )}
          {found === "NONE" && query && (
            <Notice tone="info">No registration found for &ldquo;{query}&rdquo;. Fill in your details below.</Notice>
          )}

          <Card
            title="Your details"
            action={
              <button type="button" onClick={startOver} className="text-sm font-medium text-brand-700 h-9 px-2 -mr-2 -mt-1 rounded-md hover:bg-brand-50">
                Not you?
              </button>
            }
          >
            <div className="space-y-4">
              <Field label="Full name">
                <Input required autoComplete="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mobile number">
                  <Input required type="tel" inputMode="tel" autoComplete="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input required type="email" autoComplete="email" autoCapitalize="none" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Batch">
                  <Select value={form.graduatingYear} onChange={(e) => set("graduatingYear", Number(e.target.value))}>
                    {BATCH_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Branch">
                  <Select required value={form.stream} onChange={(e) => set("stream", e.target.value)}>
                    <option value="" disabled>Select</option>
                    {STREAM_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    {form.stream && !(STREAM_TYPES as readonly string[]).includes(form.stream) && (
                      <option value={form.stream}>{form.stream}</option>
                    )}
                  </Select>
                </Field>
              </div>
              <Field group label="Course">
                <Segmented
                  label="Course"
                  value={form.course as (typeof COURSE_TYPES)[number]}
                  onChange={(v) => set("course", v)}
                  options={COURSE_TYPES.map((c) => ({ value: c, label: c }))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Food and guests" description="Helps us plan food and seating.">
            <div className="space-y-4">
              <Field group label="Food preference">
                <Segmented
                  label="Food preference"
                  value={form.foodPreference as (typeof FOOD_PREFERENCES)[number]}
                  onChange={(v) => set("foodPreference", v)}
                  options={FOOD_PREFERENCES.map((f) => ({ value: f, label: FOOD_LABELS[f] || f }))}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field group label="Family members">
                  <Stepper label="family members" value={form.accompanyingFamilyCount} onChange={(v) => set("accompanyingFamilyCount", v)} />
                </Field>
                <Field group label="Other alumni">
                  <Stepper label="other alumni" value={form.accompanyingAlumniCount} onChange={(v) => set("accompanyingAlumniCount", v)} />
                </Field>
              </div>
            </div>
          </Card>

          <PaymentCalculator
            graduatingYear={form.graduatingYear}
            registrationFee={fee}
            voluntaryContribution={contribution}
            paymentMode={paymentMode}
            utrLast4={utrLast4}
            onContributionChange={setContribution}
            onPaymentModeChange={setPaymentMode}
            onUtrChange={setUtrLast4}
          />

          {submitError && <Notice tone="error">{submitError}</Notice>}
        </Page>

        {/* Total and submit stay within thumb reach */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-line shadow-[0_-4px_12px_rgba(16,24,40,0.06)]">
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-4">
            <div className="shrink-0">
              <div className="text-xs font-medium text-muted">Total</div>
              <div className="text-xl font-semibold tracking-tight text-ink tabular-nums">{inr(total)}</div>
            </div>
            <Button type="submit" size="lg" className="flex-1" loading={submitting}>
              {total > 0 ? "Confirm and check in" : "Check in"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <RegisterFlow />
    </Suspense>
  );
}
