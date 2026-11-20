"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  AlertCircle,
  Loader2,
  Calendar,
  Building,
  Utensils,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  BATCH_YEARS,
  DEPARTMENTS,
  FOOD_PREFERENCES,
  FoodPreference,
  PaymentMode,
} from "@/server/constants";
import { PaymentCalculator } from "@/components/registration/PaymentCalculator";
import { SuccessCard } from "@/components/registration/SuccessCard";
import { Attendee, Event } from "@/types/database.types";

export default function RegisterPage() {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [batchYear, setBatchYear] = useState<number>(2020);
  const [department, setDepartment] = useState<string>("CSE");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [company, setCompany] = useState("");
  const [foodPreference, setFoodPreference] =
    useState<FoodPreference>("Vegetarian");
  const [familyMembers, setFamilyMembers] = useState<number>(0);
  const [remarks, setRemarks] = useState("");

  // Payment State
  const [membershipType, setMembershipType] = useState("None");
  const [membershipAmount, setMembershipAmount] = useState(0);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("UPI");

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(
    null
  );

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch("/api/events/active");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setActiveEvent(json.data);
          }
        }
      } catch (err) {
        console.error("Could not fetch active event", err);
      } finally {
        setLoadingEvent(false);
      }
    }
    loadEvent();
  }, []);

  const handleReset = () => {
    setRegisteredAttendee(null);
    setFullName("");
    setMobile("");
    setEmail("");
    setCity("");
    setCompany("");
    setRemarks("");
    setMembershipType("None");
    setMembershipAmount(0);
    setContributionAmount(0);
    setPaymentMode("UPI");
    setFamilyMembers(0);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!mobile.trim() || !/^[0-9]{10}$/.test(mobile.trim())) {
      setErrorMessage("Please provide a valid 10-digit mobile number.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        eventId: activeEvent?.id || null,
        name: fullName.trim(),
        batchYear,
        department,
        mobile: mobile.trim(),
        email: email.trim(),
        city: city.trim(),
        company: company.trim(),
        foodPreference,
        familyMembers,
        paymentMode,
        membershipType,
        membershipAmount,
        contributionAmount,
        remarks: remarks.trim(),
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Registration failed. Please try again.");
      }

      setRegisteredAttendee(result.data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during registration."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Header / Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-850 hover:text-teal-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </Link>
          <div className="text-right">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">
              {activeEvent ? activeEvent.title : "IRTTAA Alumni Meet"}
            </span>
            <span className="text-[11px] text-teal-600/80 font-medium">
              On-Spot Registration Desk
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {registeredAttendee ? (
            /* Success Badge View */
            <SuccessCard
              key="success-card"
              attendee={registeredAttendee}
              onReset={handleReset}
            />
          ) : (
            /* Registration Form View */
            <motion.div
              key="registration-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-teal-950/5 border border-teal-100"
            >
              {/* Form Title & Subtitle */}
              <div className="mb-8 pb-6 border-b border-teal-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                  <span>Instant Walk-In Entry</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-teal-950">
                  Walk-In Registration
                </h1>
                <p className="text-sm text-teal-800/80 mt-1">
                  Fill your alumni profile, collect membership details, and get
                  checked in immediately.
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Unable to complete registration</span>
                    <span>{errorMessage}</span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Personal Information */}
                <div>
                  <h3 className="text-base font-bold text-teal-950 flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <span>Personal Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Batch Year *
                      </label>
                      <select
                        value={batchYear}
                        onChange={(e) => setBatchYear(parseInt(e.target.value))}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      >
                        {BATCH_YEARS.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Department / Stream *
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-teal-100" />

                {/* 2. Professional Info & Preferences */}
                <div>
                  <h3 className="text-base font-bold text-teal-950 flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    <span>Professional & Preferences</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Company / Profession
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Infosys, TCS, Entrepreneur"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        City / Current Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chennai, Bangalore, Salem"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Food Preference
                      </label>
                      <select
                        value={foodPreference}
                        onChange={(e) =>
                          setFoodPreference(e.target.value as FoodPreference)
                        }
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      >
                        {FOOD_PREFERENCES.map((food) => (
                          <option key={food} value={food}>
                            {food}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                        Accompanying Family Members
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={familyMembers === 0 ? "" : familyMembers}
                        placeholder="0"
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFamilyMembers(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-full h-12 px-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-teal-100" />

                {/* 3. Fee & Contribution Details */}
                <div>
                  <h3 className="text-base font-bold text-teal-950 flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-black">
                      3
                    </span>
                    <span>Membership & Contribution</span>
                  </h3>

                  <PaymentCalculator
                    membershipType={membershipType}
                    membershipAmount={membershipAmount}
                    contributionAmount={contributionAmount}
                    paymentMode={paymentMode}
                    onMembershipChange={(type, amount) => {
                      setMembershipType(type);
                      setMembershipAmount(amount);
                    }}
                    onContributionChange={(amount) =>
                      setContributionAmount(amount)
                    }
                    onPaymentModeChange={(mode) => setPaymentMode(mode)}
                  />
                </div>

                {/* 4. Remarks */}
                <div>
                  <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                    Remarks / Suggestions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional message or note for the association committee"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-4 rounded-xl border border-teal-200 bg-white text-teal-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-sm resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 hover:from-teal-800 hover:to-teal-700 shadow-xl shadow-teal-800/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Registration & Check-In...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Complete Registration & Check-In</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-teal-700/70 mt-3">
                    Submitting automatically marks the attendee as Checked-In for
                    event entry.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
