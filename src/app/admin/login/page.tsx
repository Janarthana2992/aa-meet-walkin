"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/server/config/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Attempt Supabase Auth login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        // If Supabase Auth account is not yet configured or admin credentials match default admin
        if (
          (email.trim() === "admin@irttaa.org" || email.trim() === "admin") &&
          password.trim() === "admin123"
        ) {
          // Set local session flag for organizer access
          sessionStorage.setItem("irttaa_admin_logged_in", "true");
          sessionStorage.setItem("irttaa_admin_email", email.trim());
          router.push("/admin");
          return;
        }
        throw new Error(authError.message);
      }

      if (data.session) {
        sessionStorage.setItem("irttaa_admin_logged_in", "true");
        sessionStorage.setItem(
          "irttaa_admin_email",
          data.user?.email || email.trim()
        );
        router.push("/admin");
      }
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

  const handleOrganizerQuickLogin = () => {
    sessionStorage.setItem("irttaa_admin_logged_in", "true");
    sessionStorage.setItem("irttaa_admin_email", "admin@irttaa.org");
    router.push("/admin");
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
              Admin & Committee Login
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin@irttaa.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 text-teal-950 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-teal-200 text-teal-950 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

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
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Organizer Access Banner */}
          <div className="mt-8 pt-6 border-t border-teal-100 text-center">
            <span className="text-xs text-teal-700/70 block mb-3 font-medium">
              Event Volunteer or Committee Member?
            </span>
            <button
              type="button"
              onClick={handleOrganizerQuickLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Organizer Quick Access (Demo)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
