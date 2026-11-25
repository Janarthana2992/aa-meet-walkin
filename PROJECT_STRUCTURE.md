# IRTTAA NuzhAI — Project Architecture & File-by-File Use Case Guide

Welcome to the comprehensive architecture and folder structure guide for **IRTTAA NuzhAI** (Institute of Road and Transport Technology Alumni Association Event Portal).

This application powers multi-event alumni meets with association-master synchronization, official website pre-registration CSV imports, batch-based venue fee configurations, smart email/mobile autofill on event day, voluntary contributions, QR/UPI UTR & Cash tracking, digital event passes, and full financial/attendance analytics.

It follows a **Clean Layered Enterprise Backend Pattern** (`backend_ideas.pdf`) built on **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, **Lucide React**, **Zod**, and **Supabase (PostgreSQL + RLS)**.

---

## 1. Complete Directory Tree

```text
new_web_app/
├── data/
│   ├── DataBase_design/
│   │   ├── 001_nuzhai_schema.sql               # Finalized Supabase migration SQL (enums, 5 tables, RLS, triggers)
│   │   ├── Nuzhai_db_design_pdf.pdf            # Exported ERD schema specification (PDF)
│   │   ├── Nuzhai_db_design_png.png            # Visual ERD diagram image
│   │   ├── Nuzhai_db_design_postgre.sql        # Original dbdiagram PostgreSQL DDL
│   │   └── Nuzhai_dbdiagram_io.sql             # DBML source for dbdiagram.io
│   └── Example_data/
│       ├── event_pre_registrations.csv         # Website pre-registration export sample (19 rows)
│       └── IRTT_AA_Members.csv                 # Association member master sample (26 rows)
├── public/
│   ├── IRTTAA-LOGO-1.png                       # High-resolution IRTTAA emblem
│   ├── IRTTAA_256x256.png                      # 256x256 square badge emblem
│   ├── IRTTAA.svg                              # Vector emblem
│   ├── logo.png                                # Standard brand logo used in headers & passes
│   ├── logo.svg                                # Standard vector logo
│   └── style.css                               # Static asset helper CSS
├── src/
│   ├── types/
│   │   └── database.types.ts                   # Canonical TS interfaces matching all 5 DB tables & DTOs
│   ├── server/
│   │   ├── config/
│   │   │   └── supabase.ts                     # Dual-client Supabase setup (Anon + Admin)
│   │   ├── constants/
│   │   │   └── index.ts                        # DB enums, batch years (1988–2028) & default fee tiers
│   │   ├── utils/
│   │   │   └── csv.ts                          # RFC-4180 CSV parser & course/stream/phone normalizers
│   │   ├── validators/
│   │   │   ├── event.validator.ts              # Zod schemas for events & fee rules
│   │   │   └── registration.validator.ts       # Zod schemas for venue lookup, submit & admin edits
│   │   ├── repositories/
│   │   │   ├── event.repository.ts             # Supabase queries for `events` & `event_fee_configurations`
│   │   │   ├── member.repository.ts            # Supabase queries & upsert for `association_members`
│   │   │   ├── preRegistration.repository.ts   # Supabase queries & upsert for `event_pre_registrations`
│   │   │   └── registration.repository.ts      # Supabase queries & CRUD for `event_registrations`
│   │   ├── services/
│   │   │   ├── event.service.ts                # Event lifecycle, default fee seeding & fee computation
│   │   │   ├── import.service.ts               # CSV import orchestration for Members & Pre-Registrations
│   │   │   └── registration.service.ts         # Priority venue autofill, UTR verification & analytics
│   │   └── controllers/
│   │       ├── event.controller.ts             # Event & fee rule request orchestration
│   │       ├── import.controller.ts            # CSV upload & directory listing orchestration
│   │       └── registration.controller.ts      # Venue lookup, check-in submit & analytics orchestration
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AssociationMembersTab.tsx       # `IRTT_AA_Members.csv` importer & members directory
│   │   │   ├── EventsManagerTab.tsx            # Event creator, active switcher & Fee Rules editor modal
│   │   │   ├── OverviewAnalyticsTab.tsx        # KPIs, Fee vs Contribution, Online/Cash & batch/stream charts
│   │   │   ├── PreRegistrationsTab.tsx         # Per-event `event_pre_registrations.csv` importer & list
│   │   │   └── RegistrationsDirectoryTab.tsx   # Checked-in table, filters, edit modal & CSV export
│   │   └── registration/
│   │       ├── PaymentCalculator.tsx           # Auto-filled fee + optional contribution + QR/UTR/Cash UI
│   │       └── SuccessCard.tsx                 # Printable digital event pass (`IRTTAA-0001`)
│   └── app/
│       ├── globals.css                         # Tailwind CSS v4 theme & `@media print` pass rules
│       ├── layout.tsx                          # Root HTML layout & metadata
│       ├── page.tsx                            # Dynamic landing page connected to active event
│       ├── register/
│       │   └── page.tsx                        # Unified Venue Autofill Lookup + Registration + Check-In flow
│       ├── checkin/
│       │   └── page.tsx                        # Volunteer Desk Directory (Awaiting vs Checked-In passes)
│       ├── admin/
│       │   ├── page.tsx                        # 5-Tab Admin Portal shell
│       │   └── login/
│       │       └── page.tsx                    # Admin & Committee Login screen
│       └── api/
│           ├── events/active/route.ts          # GET active event + fee rules
│           ├── venue/lookup/route.ts           # POST email/mobile lookup across tables
│           ├── venue/fee/route.ts              # GET calculated batch fee
│           ├── register/route.ts               # POST submit venue registration & check-in
│           └── admin/
│               ├── dashboard/route.ts          # GET analytics summary
│               ├── members/route.ts            # GET members & POST `IRTT_AA_Members.csv`
│               ├── events/
│               │   ├── route.ts                # GET events & POST create event
│               │   └── [eventId]/
│               │       ├── route.ts            # PATCH update/activate & DELETE event
│               │       ├── fees/route.ts       # GET & PUT `event_fee_configurations`
│               │       └── pre-registrations/route.ts # GET & POST `event_pre_registrations.csv`
│               └── registrations/
│                   ├── route.ts                # GET filtered venue registrations
│                   └── [registrationId]/route.ts # PATCH edit & DELETE registration
├── .env.example                                # Safe environment variable template
├── .env.local                                  # Private Supabase keys (Git ignored)
├── .gitignore                                  # Exclusion rules for secrets, build cache & testing artifacts
├── backend_ideas.pdf                           # Layered backend architecture reference
├── next.config.ts                              # Next.js 15 configuration
├── package.json                                # Project scripts & dependencies
├── package-lock.json                           # Deterministic dependency lockfile
├── postcss.config.mjs                          # Tailwind CSS v4 PostCSS setup
├── PROJECT_STRUCTURE.md                        # This documentation file
├── pyproject.toml                              # Local Python/uv environment config
├── README.md                                   # Project overview
└── tsconfig.json                               # TypeScript compiler & `@/*` path alias config
```

---

## 2. Database Schema & Design Assets (`data/`)

### `data/DataBase_design/`
- **[`001_nuzhai_schema.sql`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/data/DataBase_design/001_nuzhai_schema.sql)**: Production Supabase migration script defining:
  - **8 PostgreSQL Enums**: `association_membership_type`, `event_type`, `pre_registration_response_status`, `registration_source`, `registration_membership_type`, `payment_mode` (`ONLINE`, `CASH`), `course_type` (`BE`, `ME`, `MCA`), `stream_type`.
  - **5 Core Tables**:
    1. `association_members`: Master directory of recognized IRTTAA members keyed by `member_login_id` (unique `email`, indexed `mobile`).
    2. `events`: Multi-event master (`event_id`, `event_name`, `event_type`, `chapter_name`, `venue`, `event_date`, `event_time`, `is_active`).
    3. `event_fee_configurations`: Per-event rules keyed by `(event_id, membership_type, min_graduating_year, max_graduating_year)` with default batch tiers (`1988–2000: ₹500`, `2001–2010: ₹400`, `2011–2020: ₹300`, `2021–2027: ₹0`).
    4. `event_pre_registrations`: Website export data scoped by `event_id` with `UNIQUE (event_id, email)` so re-imports never duplicate rows.
    5. `event_registrations`: Final event-day check-in snapshot (no foreign keys to member master or pre-registration by design) with `UNIQUE (event_id, email)`, fee breakdown, voluntary contribution, `payment_mode`, `utr_last4`, and `checked_in_at`.
  - **Triggers & RLS**: Automatic `set_updated_at()` triggers on all 5 tables, Row Level Security enabled with access policies, and `GRANT` privileges for `anon`, `authenticated`, and `service_role`.
- **`Nuzhai_db_design_postgre.sql` / `Nuzhai_dbdiagram_io.sql` / `Nuzhai_db_design_pdf.pdf` / `Nuzhai_db_design_png.png`**: Original DBML source and exported ERD blueprints from dbdiagram.io.

### `data/Example_data/`
- **[`IRTT_AA_Members.csv`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/data/Example_data/IRTT_AA_Members.csv)**: Sample export of 26 association members (`Patron Member`, `Life Member`, `Registered Member`).
- **[`event_pre_registrations.csv`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/data/Example_data/event_pre_registrations.csv)**: Sample export of 19 pre-registered alumni from the official IRTTAA website (contains a leading blank line, full stream names, and combined `"No of Accompanying members (Alumni/Family)"` column).

---

## 3. Shared Types & Layered Backend (`src/types/` & `src/server/`)

### `src/types/database.types.ts`
- Defines strict TypeScript interfaces matching PostgreSQL columns (`AssociationMember`, `Event`, `EventFeeConfiguration`, `EventPreRegistration`, `EventRegistration`) plus API response DTOs (`VenueLookupResult`, `EventAnalyticsMetrics`, `CategoryCount`, `CsvImportSummary`).

### `src/server/config/supabase.ts`
- Initializes both `supabase` (browser/public anon client) and `supabaseAdmin` (server-side elevated client used across backend repositories).

### `src/server/constants/index.ts`
- Defines all enum arrays (`EVENT_TYPES`, `COURSE_TYPES`, `STREAM_TYPES`, `PAYMENT_MODES`, `REGISTRATION_SOURCES`, `ASSOCIATION_MEMBERSHIP_TYPES`, `REGISTRATION_MEMBERSHIP_TYPES`), `BATCH_YEARS` (`2027` down to `1988`), and `DEFAULT_BATCH_FEE_TIERS`.

### `src/server/utils/csv.ts`
- **Use Case**: Resiliency layer for importing real-world CSV exports.
- Skips leading blank lines, parses quoted fields containing commas, normalizes phone numbers (`normalizeMobile` & `extractPhoneDigits` matching `+91-98451 31096`, `08248039920`, or `9845131096`), maps `"B.E." → BE`, full stream names → enum codes (`"Mechanical Engineering" → MECH`), `"Non-Veg" → Non-Vegetarian`, and membership labels → enum values.

### `src/server/validators/`
- [`event.validator.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/validators/event.validator.ts): Validates event creation/editing and fee configuration arrays.
- [`registration.validator.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/validators/registration.validator.ts): Validates email/mobile venue lookups, registration submission fields, and admin record edits.

### `src/server/repositories/`
- [`event.repository.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/repositories/event.repository.ts): CRUD for `events` and batch upsert/update for `event_fee_configurations`.
- [`member.repository.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/repositories/member.repository.ts): Searches `association_members` by email or normalized mobile digits and performs upserts on `member_login_id`.
- [`preRegistration.repository.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/repositories/preRegistration.repository.ts): Scoped lookups by `(event_id, email/mobile)` and upserts on `(event_id, email)`.
- [`registration.repository.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/repositories/registration.repository.ts): Filtered listing, duplicate checks by event + email/mobile, and CRUD on `event_registrations`.

### `src/server/services/`
- [`event.service.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/services/event.service.ts): Enforces single active event switching, seeds all 16 default fee configurations on new event creation, and computes batch registration fees dynamically.
- [`import.service.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/services/import.service.ts):
  - **Association Members**: Appends new members and updates existing records on re-upload (`IRTT_AA_Members.csv`).
  - **Pre-Registrations**: Stamps selected `event_id` automatically, maps accompanying counts into `accompanying_family_count`, keeps `membership_type = 'UNREGISTERED_MEMBER'` and `member_login_id = null`, and deduplicates safely by `(event_id, email)`.
- [`registration.service.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/services/registration.service.ts):
  - **Priority Venue Lookup**: Checks `event_registrations` (prevents double check-in) → `event_pre_registrations` → `association_members` → `NONE`.
  - **Authoritative Submit**: Recomputes registration fee on the server, adds optional voluntary contribution, validates mandatory 4-digit `utr_last4` for `ONLINE` payments (`total_amount > 0`), marks `payment_confirmed = true`, and records `checked_in_at`.
  - **Dashboard Analytics**: Aggregates check-ins, headcount (with accompanying counts), total fees vs voluntary contributions, `ONLINE` vs `CASH` split, catering counts, and batch/stream turnout.

### `src/server/controllers/`
- [`event.controller.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/controllers/event.controller.ts), [`import.controller.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/controllers/import.controller.ts), [`registration.controller.ts`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/server/controllers/registration.controller.ts): Handle input parsing with Zod and format consistent `{ success, data, error }` JSON responses.

---

## 4. UI Components & Pages (`src/components/` & `src/app/`)

### Modular Admin Components (`src/components/admin/`)
- [`OverviewAnalyticsTab.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/admin/OverviewAnalyticsTab.tsx): Displays KPIs (Venue Check-Ins, Total Collected, Registration Fees, Voluntary Contributions), Online vs Cash split, Pre-Registered vs On-Spot, Catering split, Batch/Stream charts, and Recent Check-Ins table.
- [`RegistrationsDirectoryTab.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/admin/RegistrationsDirectoryTab.tsx): Multi-filter directory (`graduatingYear`, `stream`, `registrationSource`, `paymentMode`), inline edit modal, delete action, and full CSV export.
- [`EventsManagerTab.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/admin/EventsManagerTab.tsx): Create/delete events, switch active event, and customize per-event batch fees in the **Fee Rules** modal.
- [`PreRegistrationsTab.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/admin/PreRegistrationsTab.tsx): Select target event, upload `event_pre_registrations.csv`, and search imported records.
- [`AssociationMembersTab.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/admin/AssociationMembersTab.tsx): Upload `IRTT_AA_Members.csv` (upsert) and browse recognized members by tier.

### Venue Registration Components (`src/components/registration/`)
- [`PaymentCalculator.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/registration/PaymentCalculator.tsx): Displays system-locked batch registration fee, optional voluntary contribution input, live total, `"Kindly do the payment using QR code on the table then Submit it."` banner, `ONLINE` (required 4-digit `utr_last4`) / `CASH` toggle, or `Free Entry` indicator.
- [`SuccessCard.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/registration/SuccessCard.tsx): Official printable attendee pass (`IRTTAA-0001`) showing badge details, payment breakdown, and UTR reference.

### App Router Pages (`src/app/`)
- [`page.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/app/page.tsx) (`/`): Landing portal dynamically showing the active event (`event_name`, `chapter_name`, `event_date`, `event_time`, `venue`).
- [`register/page.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/app/register/page.tsx) (`/register`): Unified venue registration & check-in portal supporting `?q=` deep linking from the volunteer desk.
- [`checkin/page.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/app/checkin/page.tsx) (`/checkin`): Volunteer desk directory comparing **Awaiting Check-In** pre-registrations vs **Checked In** passes.
- [`admin/page.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/app/admin/page.tsx) (`/admin`) & [`admin/login/page.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/app/admin/login/page.tsx) (`/admin/login`): Protected 5-tab management portal.

---

## 5. End-to-End Venue Flow

```text
Alumnus arrives at Venue -> Opens /register -> Enters Email or Mobile
       │
       ▼
[POST /api/venue/lookup]
  ├── Already in `event_registrations`? ──► Show existing Pass (`IRTTAA-0001`)
  ├── Found in `event_pre_registrations`? ──► Auto-fill (`PRE_REGISTERED`) + Editable
  ├── Found in `association_members`?     ──► Auto-fill (`ON_SPOT`, `recognized_member = true`) + Editable
  └── Not found anywhere?                 ──► Complete manual form (`ON_SPOT`, `UNREGISTERED_MEMBER`)
       │
       ▼
System auto-fills Batch Registration Fee (from `event_fee_configurations`)
  + Alumnus enters optional Voluntary Contribution
  = Total Payable Amount
       │
       ▼
If Total > 0: Shows QR payment prompt -> Pick `ONLINE` (+ required 4-digit `utr_last4`) or `CASH`
If Total = 0: Shows Free Entry banner (no payment required)
       │
       ▼
[POST /api/register] -> Server recomputes fee -> Saves `event_registrations` snapshot
       │
       ▼
Displays Printable Pass (`SuccessCard`) & updates Admin Live Analytics instantly
```
