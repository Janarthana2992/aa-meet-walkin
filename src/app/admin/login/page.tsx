"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader, Button, Field, Input, Notice, Page, Segmented, api } from "@/components/ui";

type Mode = "admin" | "desk";

function nextPath(mode: Mode): string {
  const fallback = mode === "admin" ? "/admin" : "/checkin";
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (mode === "desk" && !next.startsWith("/checkin")) return "/checkin";
  return next;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api("/api/auth/login", {
        method: "POST",
        json: mode === "admin" ? { mode, email: email.trim(), password } : { mode, pin: pin.trim() },
      });
      router.replace(nextPath(mode));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="Staff sign in" subtitle="Organizers and desk volunteers" />
      <Page className="max-w-md">
        <Segmented
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
          options={[
            { value: "admin", label: "Organizer" },
            { value: "desk", label: "Desk volunteer" },
          ]}
        />

        <form onSubmit={submit} className="space-y-4">
          {mode === "admin" ? (
            <>
              <Field label="Email">
                <Input
                  type="email"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </>
          ) : (
            <Field label="Desk PIN" hint="Ask an organizer for today's PIN. Opens the check-in desk only.">
              <Input
                type="password"
                inputMode="numeric"
                required
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </Field>
          )}

          {error && <Notice tone="error">{error}</Notice>}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {mode === "admin" ? "Sign in" : "Open check-in desk"}
          </Button>
        </form>
      </Page>
    </>
  );
}
