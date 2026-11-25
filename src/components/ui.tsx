"use client";

/**
 * Shared UI kit. All pages use these components so the look is defined once.
 * Style: plain and neutral (white surfaces, thin borders, one accent colour).
 * Mobile: 16px form text (prevents iOS zoom) and 44px minimum touch targets.
 */
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronLeft, Info, Loader2, Minus, Plus, X } from "lucide-react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const inr = (n: number | string | null | undefined) =>
  `₹${(Number(n) || 0).toLocaleString("en-IN")}`;

/* ------------------------------------------------------------------ layout */

export function AppHeader({
  title,
  subtitle,
  back,
  right,
  wide,
}: {
  title: string;
  subtitle?: string | null;
  /** Shows a back link instead of the logo */
  back?: { href: string; label: string };
  right?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 no-print">
      <div className={cx("mx-auto px-4 h-14 flex items-center gap-3", wide ? "max-w-5xl" : "max-w-2xl")}>
        {back ? (
          <Link
            href={back.href}
            aria-label={back.label}
            className="-ml-2 w-10 h-10 shrink-0 rounded-md flex items-center justify-center text-stone-600 hover:bg-stone-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        ) : (
          <Link href="/" className="shrink-0" aria-label="Home">
            <Image src="/logo.png" alt="" width={28} height={28} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-stone-900 truncate leading-tight">{title}</div>
          {subtitle && <div className="text-xs text-stone-500 truncate">{subtitle}</div>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Page({
  children,
  wide,
  className,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <main className={cx("mx-auto px-4 py-5 space-y-4", wide ? "max-w-5xl" : "max-w-2xl", className)}>
      {children}
    </main>
  );
}

export function PageTitle({
  children,
  description,
  action,
}: {
  children: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-stone-900">{children}</h1>
        {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
  title,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className={cx("bg-white rounded-lg border border-stone-200 p-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-3">
          {title && <h2 className="text-[15px] font-semibold text-stone-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Underlined tab row that scrolls sideways on narrow screens. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  wide,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  wide?: boolean;
}) {
  return (
    <nav className="bg-white border-b border-stone-200 no-print">
      <div
        role="tablist"
        className={cx(
          "mx-auto px-2 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          wide ? "max-w-5xl" : "max-w-2xl"
        )}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={value === t.id}
            onClick={() => onChange(t.id)}
            className={cx(
              "shrink-0 h-11 px-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
              value === t.id
                ? "border-teal-800 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------- forms */

/**
 * Labelled form row. Use `group` when the children are buttons (steppers,
 * chips): a <label> would forward taps on its text to the first button.
 */
export function Field({
  label,
  hint,
  children,
  className,
  group,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  group?: boolean;
}) {
  const content = (
    <>
      <span className="block text-sm font-medium text-stone-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-500 mt-1">{hint}</span>}
    </>
  );
  return group ? (
    <div role="group" aria-label={label} className={cx("block", className)}>
      {content}
    </div>
  ) : (
    <label className={cx("block", className)}>{content}</label>
  );
}

const controlBase =
  "w-full h-11 px-3 rounded-md border border-stone-300 bg-white text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 disabled:bg-stone-50 disabled:text-stone-500";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} {...props} className={cx(controlBase, className)} />;
  }
);

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(controlBase, "pr-8", className)} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(controlBase, "h-auto min-h-20 py-2.5", className)} />;
}

/** − 0 + counter; easier than a number input on phones. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 20,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  const btn =
    "w-11 h-full flex items-center justify-center text-stone-700 hover:bg-stone-50 disabled:text-stone-300";
  return (
    <div className="flex items-stretch h-11 rounded-md border border-stone-300 bg-white overflow-hidden">
      <button type="button" aria-label={`Fewer ${label}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className={cx(btn, "border-r border-stone-200")}>
        <Minus className="w-4 h-4" />
      </button>
      <span className="flex-1 flex items-center justify-center text-base font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={`More ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className={cx(btn, "border-l border-stone-200")}>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Single choice shown as joined buttons (payment mode, filters, food). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  label,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx("grid rounded-md border border-stone-300 overflow-hidden bg-white", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "min-h-11 px-2 text-sm font-medium",
            i > 0 && "border-l border-stone-300",
            value === o.value ? "bg-teal-800 text-white" : "text-stone-700 hover:bg-stone-50"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- buttons */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-teal-800 text-white hover:bg-teal-900",
  secondary: "bg-white text-stone-800 border border-stone-300 hover:bg-stone-50",
  ghost: "text-teal-800 hover:bg-stone-100",
  danger: "bg-white text-red-700 border border-red-300 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 cursor-pointer",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-[15px]",
        size === "lg" && "h-12 px-5 text-base",
        buttonVariants[variant],
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-[15px]",
        size === "lg" && "h-12 px-5 text-base",
        buttonVariants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

/* --------------------------------------------------------------- feedback */

export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info: "bg-stone-50 border-stone-300 text-stone-800",
    success: "bg-green-50 border-green-300 text-green-900",
    warning: "bg-amber-50 border-amber-300 text-amber-900",
    error: "bg-red-50 border-red-300 text-red-900",
  }[tone];
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertCircle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex gap-2.5 px-3 py-2.5 rounded-md border text-sm", styles, className)}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="py-12 flex items-center justify-center gap-2 text-stone-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-10 text-center text-sm text-stone-500">{children}</div>;
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
  children: React.ReactNode;
}) {
  const styles = {
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
    green: "bg-green-50 text-green-800 border-green-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-800 border-red-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
  }[tone];
  return (
    <span className={cx("inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium whitespace-nowrap", styles)}>
      {children}
    </span>
  );
}

export function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <div className="text-sm text-stone-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">{value}</div>
      {note && <div className="text-xs text-stone-500 mt-0.5">{note}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ sheet */

/** Bottom sheet on phones, centred dialog on larger screens. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-stone-900/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92dvh] flex flex-col bg-white rounded-t-lg sm:rounded-lg">
        <div className="flex items-center justify-between gap-3 px-4 h-14 border-b border-stone-200 shrink-0">
          <h2 className="text-[15px] font-semibold text-stone-900 truncate">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 rounded-md flex items-center justify-center text-stone-500 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">{children}</div>
        {footer && (
          <div className="px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-stone-200 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- helpers */

export const passNumber = (id: number) => `IRTTAA-${String(id).padStart(4, "0")}`;

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export async function api<T = unknown>(
  url: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = init || {};
  const res = await fetch(url, {
    ...rest,
    headers: json !== undefined ? { "Content-Type": "application/json", ...(rest.headers || {}) } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 401 && typeof window !== "undefined" && url.startsWith("/api/admin")) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body as T;
}
