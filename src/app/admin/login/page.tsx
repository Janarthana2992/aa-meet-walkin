"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
type LoginMode = "admin" | "desk";

function safeNextPath(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  // Only allow same-site relative paths
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body =
        mode === "admin"
          ? { mode, email: email.trim(), password }
          : { mode, pin: pin.trim() };
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Sign in failed. Please try again.");
      }
      const fallback = mode === "admin" ? "/admin" : "/checkin";
      let next = safeNextPath(fallback);
      if (mode === "desk" && !next.startsWith("/checkin")) next = "/checkin";
      router.replace(next);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-850 hover:text-teal-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-teal-950/10 border border-teal-200/80"
        >
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-xl shadow-teal-900/15 border-2 border-teal-200/90 bg-white flex items-center justify-center p-1">
              <Image
                src="/logo.png"
                alt="IRTTAA Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h2 className="text-2xl font-black text-teal-950 tracking-tight">
              Organizer & Desk Login
            </h2>
            <p className="text-xs text-teal-700/80 font-medium mt-1">
              Event configuration, analytics, and attendee data
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl bg-teal-50 border border-teal-100">
            {(["admin", "desk"] as LoginMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  mode === m
                    ? "bg-white text-teal-950 shadow-sm"
                    : "text-teal-700 hover:text-teal-900"
                }`}
              >
                {m === "admin" ? "Organizer" : "Desk Volunteer"}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {mode === "admin" ? (
              <>
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="username"
                      required
                      placeholder="organizer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 text-teal-950 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 text-teal-950 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label
                  htmlFor="login-pin"
                  className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2"
                >
                  Desk PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="login-pin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    placeholder="PIN shared by the organizers"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 text-teal-950 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none transition-all shadow-sm"
                  />
                </div>
                <p className="mt-2 text-[11px] text-teal-700/80">
                  Gives access to the check-in desk directory only.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 shadow-lg shadow-teal-800/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>{mode === "admin" ? "Sign In" : "Open Check-In Desk"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
