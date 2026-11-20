"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  UserPlus,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Event } from "@/types/database.types";

export default function HomePage() {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  useEffect(() => {
    async function fetchActiveEvent() {
      try {
        const res = await fetch("/api/events/active");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setActiveEvent(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load active event", err);
      }
    }
    fetchActiveEvent();
  }, []);

  const formatEventDate = (dateStr?: string) => {
    if (!dateStr) return "26 September 2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-teal-50 via-teal-100/30 to-amber-50/20">
      {/* Top Navbar */}
      <header className="w-full border-b border-teal-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-teal-900/15 border-2 border-teal-200/80 bg-white flex items-center justify-center p-0.5">
              <Image
                src="/logo.png"
                alt="IRTTAA Official Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-teal-950 tracking-tight leading-none">
                IRTTAA NuzhAI
              </h1>
              <p className="text-xs font-medium text-teal-700/80 mt-1">
                Alumni Association Event Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-teal-900 bg-teal-100/60 hover:bg-teal-200/70 border border-teal-200 transition-all duration-200"
            >
              <Shield className="w-4 h-4 text-teal-700" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-100/80 border border-teal-300/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Official Event Portal</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-teal-950 tracking-tight leading-tight"
          >
            {activeEvent ? (
              activeEvent.title
            ) : (
              <>
                Chennai Chapter Meet{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-orange-500">
                  2026
                </span>
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-teal-850/80 max-w-2xl mx-auto leading-relaxed"
          >
            {activeEvent?.description ||
              "Welcome IRTT Alumni! Fast-track your on-spot registration, collect event badges, and reconnect with fellow batchmates."}
          </motion.p>

          {/* Event Quick Details Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto p-4 rounded-2xl bg-white/90 shadow-xl shadow-teal-900/5 border border-teal-100"
          >
            <div className="flex items-center justify-center space-x-2.5 text-teal-900 font-semibold text-sm">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{formatEventDate(activeEvent?.event_date)}</span>
            </div>
            <div className="flex items-center justify-center space-x-2.5 text-teal-900 font-semibold text-sm">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>{activeEvent?.event_time || "09:30 AM - 05:00 PM"}</span>
            </div>
            <div className="flex items-center justify-center space-x-2.5 text-teal-900 font-semibold text-sm">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>{activeEvent?.location || "Chennai, Tamil Nadu"}</span>
            </div>
          </motion.div>
        </div>

        {/* Action Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Alumni Walk-in Portal */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="p-8 rounded-3xl bg-white shadow-xl shadow-teal-950/5 border border-teal-100 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-teal-200/40 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-6 text-teal-700 shadow-sm">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-teal-950">
                Walk-In Registration
              </h3>
              <p className="mt-2 text-teal-800/70 text-sm leading-relaxed">
                Just arrived at the venue? Fill your details in seconds, choose
                membership or contribution, and get instantly checked in.
              </p>
            </div>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center justify-between w-full px-6 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 shadow-lg shadow-teal-800/25 transition-all group-hover:shadow-xl"
            >
              <span>Start Registration</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Desk Check-in Portal */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="p-8 rounded-3xl bg-white shadow-xl shadow-teal-950/5 border border-teal-100 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-orange-200/40 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-6 text-orange-600 shadow-sm">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-teal-950">
                Search & Desk Check-In
              </h3>
              <p className="mt-2 text-teal-800/70 text-sm leading-relaxed">
                Pre-registered alumni can quickly be verified by Mobile Number,
                Batch Year, or Name for instant badge release and entry.
              </p>
            </div>
            <Link
              href="/checkin"
              className="mt-8 inline-flex items-center justify-between w-full px-6 py-4 rounded-2xl text-base font-bold text-teal-950 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-all group-hover:border-teal-300"
            >
              <span>Desk Check-In</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 text-teal-700" />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-teal-200/60 py-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-teal-800/60 font-medium">
          Powered by IRTTAA NuzhAI • Institute of Road and Transport Technology
          Alumni Association
        </div>
      </footer>
    </div>
  );
}
