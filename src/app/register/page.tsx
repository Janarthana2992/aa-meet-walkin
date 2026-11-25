"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Award,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  BATCH_YEARS,
  COURSE_TYPES,
  DEFAULT_BATCH_FEE_TIERS,
  FOOD_PREFERENCES,
  PaymentMode,
  RegistrationMembershipType,
  RegistrationSource,
  STREAM_TYPES,
} from "@/server/constants";
import {
  Event,
  EventFeeConfiguration,
  EventRegistration,
  VenueLookupResult,
} from "@/types/database.types";
import { PaymentCalculator } from "@/components/registration/PaymentCalculator";
import { SuccessCard } from "@/components/registration/SuccessCard";

function RegisterFlowContent() {
  const searchParams = useSearchParams();

  // Active Event & Fee Schedule
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [feeRules, setFeeRules] = useState<EventFeeConfiguration[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Step 1: Lookup State
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupBanner, setLookupBanner] = useState<{
    type: "pre_reg" | "member" | "none" | "error";
    message: string;
  } | null>(null);

  // Step 2: Form Fields
  const [memberLoginId, setMemberLoginId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [graduatingYear, setGraduatingYear] = useState<number>(2002);
  const [course, setCourse] = useState<string>("BE");
  const [stream, setStream] = useState<string>("CSE");
  const [membershipTypeUsed, setMembershipTypeUsed] =
    useState<RegistrationMembershipType>("UNREGISTERED_MEMBER");
  const [registrationSource, setRegistrationSource] =
    useState<RegistrationSource>("ON_SPOT");
  const [recognizedMember, setRecognizedMember] = useState<boolean>(false);
  const [foodPreference, setFoodPreference] = useState<string>("Vegetarian");
  const [accompanyingFamilyCount, setAccompanyingFamilyCount] =
    useState<number>(0);
  const [accompanyingAlumniCount, setAccompanyingAlumniCount] =
    useState<number>(0);

  // Step 3: Payment & Fee State
  const [voluntaryContribution, setVoluntaryContribution] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("ONLINE");
  const [utrLast4, setUtrLast4] = useState<string>("");

  // Step 4: Submission & Confirmation
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedRegistration, setCompletedRegistration] =
    useState<EventRegistration | null>(null);

  // Compute fee live from event_fee_configurations (with default batch fallback)
  const computeBatchFee = useCallback(
    (year: number, membership: RegistrationMembershipType) => {
      const activeRules = feeRules.filter((r) => r.is_active);
      if (activeRules.length > 0) {
        const exact = activeRules.find(
          (r) =>
            r.membership_type === membership &&
            year >= r.min_graduating_year &&
            year <= r.max_graduating_year
        );
        if (exact) return Number(exact.registration_fee) || 0;

        const yearOnly = activeRules.find(
          (r) => year >= r.min_graduating_year && year <= r.max_graduating_year
        );
        if (yearOnly) return Number(yearOnly.registration_fee) || 0;
      }

      const fallback = DEFAULT_BATCH_FEE_TIERS.find(
        (t) => year >= t.minGraduatingYear && year <= t.maxGraduatingYear
      );
      if (fallback) return fallback.registrationFee;
      return year >= 2021 ? 0 : 500;
    },
    [feeRules]
  );

  const registrationFee = computeBatchFee(graduatingYear, membershipTypeUsed);

  const performLookup = useCallback(
    async (queryStr: string, eventId?: number) => {
      if (!queryStr.trim()) return;
      setLookingUp(true);
      setLookupBanner(null);
      setSubmitError(null);

      try {
        const res = await fetch("/api/venue/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: eventId || activeEvent?.event_id,
            query: queryStr.trim(),
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Lookup failed");
        }

        const result: VenueLookupResult = json.data;

        if (result.alreadyRegistered && result.existingRegistration) {
          setCompletedRegistration(result.existingRegistration);
          return;
        }

        if (result.found && result.prefill) {
          const p = result.prefill;
          setMemberLoginId(p.member_login_id);
          setFullName(p.full_name || "");
          setEmail(p.email || "");
          setMobile(p.mobile || "");
          setCourse(p.course || "BE");
          setStream(p.stream || "CSE");
          if (p.graduating_year) setGraduatingYear(p.graduating_year);
          setMembershipTypeUsed(p.membership_type_used);
          setRecognizedMember(p.recognized_member);
          setFoodPreference(p.food_preference || "Vegetarian");
          setAccompanyingAlumniCount(p.accompanying_alumni_count || 0);
          setAccompanyingFamilyCount(p.accompanying_family_count || 0);

          if (result.source === "PRE_REGISTERED") {
            setRegistrationSource("PRE_REGISTERED");
            setLookupBanner({
              type: "pre_reg",
              message:
                "Found in Event Pre-Registrations! Your details are pre-filled below—please review or edit before submitting.",
            });
          } else {
            setRegistrationSource("ON_SPOT");
            setLookupBanner({
              type: "member",
              message:
                "Recognized IRTTAA Member! Your profile was auto-filled from Association Members—please verify and complete your check-in.",
            });
          }
        } else {
          setMemberLoginId(null);
          setRegistrationSource("ON_SPOT");
          setRecognizedMember(false);
          setMembershipTypeUsed("UNREGISTERED_MEMBER");

          // Pre-fill entered email/mobile into the respective input so user doesn't retype
          if (queryStr.includes("@")) {
            setEmail(queryStr.trim().toLowerCase());
          } else {
            setMobile(queryStr.trim());
          }

          setLookupBanner({
            type: "none",
            message:
              "No existing pre-registration or member record found. Please fill out the complete form below.",
          });
        }
      } catch (err: unknown) {
        setLookupBanner({
          type: "error",
          message:
            err instanceof Error ? err.message : "Could not look up details",
        });
      } finally {
        setLookingUp(false);
      }
    },
    [activeEvent]
  );

  // Load active event & handle optional ?q= param
  useEffect(() => {
    async function loadActiveEvent() {
      try {
        const res = await fetch("/api/events/active");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setActiveEvent(json.data);
            setFeeRules(json.feeRules || []);
            const initialQ = searchParams.get("q");
            if (initialQ) {
              setLookupQuery(initialQ);
              performLookup(initialQ, json.data.event_id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch active event", err);
      } finally {
        setLoadingEvent(false);
      }
    }
    loadActiveEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(lookupQuery);
  };

  const handleReset = () => {
    setCompletedRegistration(null);
    setLookupQuery("");
    setLookupBanner(null);
    setMemberLoginId(null);
    setFullName("");
    setEmail("");
    setMobile("");
    setGraduatingYear(2002);
    setCourse("BE");
    setStream("CSE");
    setMembershipTypeUsed("UNREGISTERED_MEMBER");
    setRegistrationSource("ON_SPOT");
    setRecognizedMember(false);
    setFoodPreference("Vegetarian");
    setAccompanyingFamilyCount(0);
    setAccompanyingAlumniCount(0);
    setVoluntaryContribution(0);
    setPaymentMode("ONLINE");
    setUtrLast4("");
    setSubmitError(null);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) {
      setSubmitError("No active event is configured right now.");
      return;
    }

    const total = registrationFee + voluntaryContribution;
    if (total > 0 && paymentMode === "ONLINE" && !/^[0-9]{4}$/.test(utrLast4)) {
      setSubmitError(
        "Please enter the last 4 digits of your UPI / UTR reference after completing the QR payment."
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: activeEvent.event_id,
          memberLoginId,
          fullName: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          course,
          stream,
          graduatingYear: Number(graduatingYear),
          membershipTypeUsed,
          registrationSource,
          recognizedMember,
          foodPreference,
          accompanyingAlumniCount: Number(accompanyingAlumniCount) || 0,
          accompanyingFamilyCount: Number(accompanyingFamilyCount) || 0,
          voluntaryContribution: Number(voluntaryContribution) || 0,
          paymentMode: total > 0 ? paymentMode : null,
          utrLast4: total > 0 && paymentMode === "ONLINE" ? utrLast4 : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Registration submission failed");
      }

      setCompletedRegistration(json.data);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit registration"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-teal-700" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-teal-200 bg-white p-0.5 shadow-sm">
              <Image
                src="/logo.png"
                alt="IRTTAA Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-teal-950">
                {activeEvent ? activeEvent.event_name : "IRTTAA NuzhAI"}
              </div>
              <div className="text-[10px] font-semibold text-teal-700/80">
                {activeEvent?.venue || "Venue Check-In"}
              </div>
            </div>
          </div>
        </div>

        {loadingEvent ? (
          <div className="p-16 bg-white rounded-3xl shadow-xl border border-teal-100 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            <span className="text-xs font-bold text-teal-800">
              Loading active event details...
            </span>
          </div>
        ) : !activeEvent ? (
          <div className="p-10 bg-white rounded-3xl shadow-xl border border-amber-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h2 className="text-xl font-black text-teal-950">
              No Active Event Available
            </h2>
            <p className="text-xs text-teal-800/80 max-w-md mx-auto">
              An administrator needs to create and activate an event in the Admin
              Portal before alumni can register at the venue.
            </p>
            <Link
              href="/admin/login"
              className="inline-block px-5 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold mt-2"
            >
              Go to Admin Portal
            </Link>
          </div>
        ) : completedRegistration ? (
          <SuccessCard
            registration={completedRegistration}
            eventName={activeEvent.event_name}
            onReset={handleReset}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Step 1: Smart Lookup Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-xl shadow-teal-950/5 border border-teal-200/80">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-700 mb-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Step 1 — Quick Auto-Fill</span>
              </div>
              <h2 className="text-2xl font-black text-teal-950">
                Check Your Pre-Registration or Member Profile
              </h2>
              <p className="text-xs text-teal-800/75 mt-1 mb-4">
                Enter your registered <strong>Email</strong> or{" "}
                <strong>Mobile Number</strong> to auto-fill your details, or fill
                out the form directly below if you are new.
              </p>

              <form
                onSubmit={handleLookupSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter Email (e.g. name@gmail.com) or 10-digit Mobile..."
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-teal-200 text-sm font-semibold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={lookingUp || !lookupQuery.trim()}
                  className="h-11 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60 shrink-0"
                >
                  {lookingUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Find My Details</span>
                </button>
              </form>

              {lookupBanner && (
                <div
                  className={`mt-4 p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${
                    lookupBanner.type === "pre_reg"
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : lookupBanner.type === "member"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : lookupBanner.type === "error"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  {lookupBanner.type === "pre_reg" ? (
                    <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  ) : lookupBanner.type === "member" ? (
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : lookupBanner.type === "error" ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{lookupBanner.message}</span>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Editable Profile + Fee & QR Payment Form */}
            <form
              onSubmit={handleSubmitRegistration}
              className="p-6 sm:p-8 rounded-3xl bg-white shadow-xl shadow-teal-950/5 border border-teal-200/80 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-700">
                    Step 2 — Event Registration Details
                  </span>
                  <h3 className="text-xl font-black text-teal-950 mt-0.5">
                    Review & Complete Your Info
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    registrationSource === "PRE_REGISTERED"
                      ? "bg-blue-100 text-blue-800"
                      : recognizedMember
                      ? "bg-purple-100 text-purple-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {registrationSource === "PRE_REGISTERED"
                    ? "Pre-Registered"
                    : recognizedMember
                    ? "Recognized Member (On-Spot)"
                    : "On-Spot Registration"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-teal-200 text-sm font-semibold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-teal-200 text-sm font-semibold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-teal-200 text-sm font-semibold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                    Graduating Batch Year *
                  </label>
                  <select
                    value={graduatingYear}
                    onChange={(e) => setGraduatingYear(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl border border-teal-200 bg-white text-sm font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {BATCH_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                      Course
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-teal-200 bg-white text-sm font-semibold text-teal-950"
                    >
                      {COURSE_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                      Stream / Branch
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-teal-200 bg-white text-sm font-semibold text-teal-950"
                    >
                      {STREAM_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                    Food Preference
                  </label>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-teal-200 bg-white text-sm font-semibold text-teal-950"
                  >
                    {FOOD_PREFERENCES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                      Accompanying Family
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={accompanyingFamilyCount}
                      onChange={(e) =>
                        setAccompanyingFamilyCount(
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-full h-11 px-3 rounded-xl border border-teal-200 text-sm font-semibold text-teal-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-teal-900 uppercase mb-1.5">
                      Accompanying Alumni
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={accompanyingAlumniCount}
                      onChange={(e) =>
                        setAccompanyingAlumniCount(
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-full h-11 px-3 rounded-xl border border-teal-200 text-sm font-semibold text-teal-950"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-teal-100 pt-6">
                <span className="text-xs font-black uppercase tracking-wider text-teal-700 block mb-4">
                  Step 3 — Fee Calculation & Payment
                </span>
                <PaymentCalculator
                  graduatingYear={graduatingYear}
                  registrationFee={registrationFee}
                  voluntaryContribution={voluntaryContribution}
                  paymentMode={paymentMode}
                  utrLast4={utrLast4}
                  onContributionChange={setVoluntaryContribution}
                  onPaymentModeChange={setPaymentMode}
                  onUtrChange={setUtrLast4}
                />
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-black text-base shadow-xl shadow-teal-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Completing Registration...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      Submit & Check In
                      {registrationFee + voluntaryContribution > 0
                        ? ` (₹${(
                            registrationFee + voluntaryContribution
                          ).toLocaleString("en-IN")})`
                        : " (Free Entry)"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-teal-50">
          <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
        </div>
      }
    >
      <RegisterFlowContent />
    </Suspense>
  );
}
