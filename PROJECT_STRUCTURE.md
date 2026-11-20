# IRTTAA NuzhAI — Project Architecture & File-by-File Use Case Guide

Welcome to the comprehensive architecture and folder structure guide for **IRTTAA NuzhAI** (Institute of Road and Transport Technology Alumni Association Event Portal).

This modern web application is designed to handle on-spot walk-in alumni registrations, front-desk verification check-ins, fee reconciliation, financial analytics, and multi-event management. It strictly adheres to a **Clean Layered Enterprise Backend Pattern** (inspired by `backend_ideas.pdf`) built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, and Supabase.

---

## 1. High-Level Directory Tree

```text
new_web_app/
├── data/                                 # Seed datasets & CSV benchmarks
│   └── example_attendees_data.csv        # Real-world benchmark CSV (93 pre-registered alumni)
├── public/                               # Static media, icons & brand assets
│   ├── IRTTAA-LOGO-1.png                 # High-resolution original IRTTAA emblem
│   ├── IRTTAA_256x256.png                # Optimized 256x256 square badge emblem
│   ├── IRTTAA.svg                        # Vector IRTTAA emblem
│   ├── logo.png                          # Standard official logo used across headers & badges
│   ├── logo.svg                          # Standard vector logo
│   └── style.css                         # Static asset stylesheet helper
├── src/
│   ├── app/                              # Next.js App Router (Pages, Layouts & API Routes)
│   │   ├── globals.css                   # Tailwind CSS v4 styling & @media print badge rules
│   │   ├── layout.tsx                    # Root HTML layout with Google Inter & metadata
│   │   ├── page.tsx                      # Dynamic Home Landing Page (Hero + Portal Switcher)
│   │   ├── register/
│   │   │   └── page.tsx                  # Alumni Walk-In On-Spot Registration Portal
│   │   ├── checkin/
│   │   │   └── page.tsx                  # Desk Check-In & Multi-Filter Search Portal
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Admin Portal (Analytics, Directory, Events Manager)
│   │   │   └── login/
│   │   │       └── page.tsx              # Admin & Committee Authentication Screen
│   │   └── api/                          # Serverless Layered API Endpoints
│   │       ├── register/
│   │       │   └── route.ts              # POST /api/register (Walk-in attendee creation)
│   │       ├── checkin/
│   │       │   ├── search/
│   │       │   │   └── route.ts          # GET /api/checkin/search (Multi-parameter desk search)
│   │       │   └── [attendeeId]/
│   │       │       └── route.ts          # POST /api/checkin/:id (Check-in & fee reconciliation)
│   │       ├── events/
│   │       │   └── active/
│   │       │       └── route.ts          # GET /api/events/active (Currently active meet metadata)
│   │       └── admin/
│   │           ├── dashboard/
│   │           │   └── route.ts          # GET /api/admin/dashboard (Aggregate stats & metrics)
│   │           ├── events/
│   │           │   ├── route.ts          # GET /api/admin/events & POST /api/admin/events
│   │           │   └── [eventId]/
│   │           │       └── route.ts      # PATCH /api/admin/events/:id & DELETE
│   │           └── attendees/
│   │               └── [attendeeId]/
│   │                   └── route.ts      # PATCH & DELETE /api/admin/attendees/:id
│   ├── components/                       # Reusable React UI Components
│   │   ├── checkin/
│   │   │   └── AttendeeCheckInCard.tsx   # Accordion desk card with expandable payment modal
│   │   └── registration/
│   │       ├── PaymentCalculator.tsx     # Interactive fee calculator (Membership + Contribution)
│   │       └── SuccessCard.tsx           # Printable attendee pass & digital badge
│   ├── server/                           # Layered Backend Architecture (backend_ideas.pdf)
│   │   ├── config/
│   │   │   └── supabase.ts               # Dual-client Supabase initialization (Anon + Admin)
│   │   ├── constants/
│   │   │   └── index.ts                  # Enums (Departments, Fees, Payment Modes, Batches)
│   │   ├── validators/
│   │   │   ├── attendee.validator.ts     # Zod validation schemas for registration & check-in
│   │   │   └── event.validator.ts        # Zod validation schema for event creation/updates
│   │   ├── repositories/
│   │   │   ├── attendee.repository.ts    # Database abstraction layer for `attendees` table
│   │   │   └── event.repository.ts       # Database abstraction layer for `events` table
│   │   ├── services/
│   │   │   ├── attendee.service.ts       # Business logic (ID generation, calculations, search)
│   │   │   └── event.service.ts          # Business logic (Active event exclusivity, slug checks)
│   │   └── controllers/
│   │       ├── attendee.controller.ts    # HTTP request parsing & validation orchestration
│   │       └── event.controller.ts       # Event lifecycle request handler
│   └── types/
│       └── database.types.ts             # Shared TypeScript models (Attendee, Event, Metrics)
├── .env.example                          # Environment variable template for cloning/setup
├── .env.local                            # Local private Supabase credentials (IGNORED)
├── .gitignore                            # Comprehensive ignore rules (secrets, caches, build)
├── backend_ideas.pdf                     # Original architectural specification & flowcharts
├── next.config.ts                        # Next.js 15 framework configuration
├── package.json                          # Project dependencies, scripts & metadata
├── package-lock.json                     # Deterministic dependency lockfile
├── postcss.config.mjs                    # PostCSS configuration for Tailwind CSS v4
├── pyproject.toml                        # Local Python/uv project configuration
├── README.md                             # Project setup and overview guide
└── tsconfig.json                         # TypeScript compiler configuration & path aliases (@/*)
```

---

## 2. Root Files & Configurations

### `package.json` & `package-lock.json`
- **Use Case**: Defines all core dependencies, devDependencies, and npm run scripts.
- **Key Packages**:
  - `next` (^15.5.29) & `react` (^19.0.0): App Router foundation.
  - `@tailwindcss/postcss` (^4.0.0) & `tailwindcss`: Utility-first modern CSS.
  - `framer-motion` (^12.4.7): Fluid animations, page transitions, and expandable accordions.
  - `lucide-react`: Cohesive icon set for badges, cash, calendars, checkmarks, etc.
  - `@supabase/supabase-js`: Client SDK connecting to Supabase PostgreSQL and Storage.
  - `zod`: Strict runtime schema validation for backend APIs.
- **Lockfile**: Ensures every machine installs the exact same sub-dependencies.

### `tsconfig.json`
- **Use Case**: TypeScript compiler settings.
- **Key Feature**: Configures path alias `"@/*": ["./src/*"]` so files can import cleanly across layers without brittle relative path chains (e.g. `import { supabase } from "@/server/config/supabase"`).

### `next.config.ts`
- **Use Case**: Next.js server and compilation configuration. Controls image domains, experimental flags, and build headers.

### `postcss.config.mjs`
- **Use Case**: PostCSS configuration loader. Binds `@tailwindcss/postcss` for Tailwind CSS v4 compilation into Next.js.

### `.gitignore`
- **Use Case**: Prevents sensitive keys (`.env.local`), build artifacts (`.next/`, `*.tsbuildinfo`), test outputs (`.playwright-mcp/`), dependencies (`node_modules/`), and virtual environments (`.venv/`) from being committed to Git.

### `.env.example` & `.env.local`
- **Use Case**:
  - `.env.example`: Safe, public template committed to Git showing needed variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
  - `.env.local`: Secret local file holding live credentials. Never committed.

### `backend_ideas.pdf`
- **Use Case**: Architecture blueprint provided by the association outlining the controller-service-repository pattern, multi-event registration requirements, and fee collection workflows.

### `pyproject.toml`
- **Use Case**: Project descriptor for the Python environment managed via the `uv` tool for local data processing and scripts.

---

## 3. Data Assets (`data/`)

### `data/example_attendees_data.csv`
- **Use Case**: Benchmark and seed data containing 93 real alumni registrations from previous meets.
- **Fields Represented**:
  - `attendee_id` (e.g. `IRTTAA-001D45C5`)
  - `name`, `course`, `stream` (MECH, EEE, CSE, ECE, AUTO, IT, CIVIL, CTRANS, MCA)
  - `batch_year` (1988 - 2028)
  - `email`, `mobile`, `food_preference` (Vegetarian, Non-Veg)
  - `payment_status` (Paid, Pending), `payment_mode` (Online, Cash, UPI), `amount_paid`
  - `checked_in` (TRUE/FALSE), `checked_in_at`
- **Significance**: Serves as the ground truth schema when verifying database tables and desk search filters.

---

## 4. Public Assets (`public/`)

### `public/logo.png` & `public/logo.svg`
- **Use Case**: Official IRTTAA emblem used prominently in:
  - Global navigation headers ([`src/app/page.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/app/page.tsx))
  - Printable alumni badges ([`SuccessCard.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/components/registration/SuccessCard.tsx))
  - Admin login brand card ([`src/app/admin/login/page.tsx`](file:///c:/Users/SundarrajMuthuKumar/Downloads/IRTT_AA/aa-meet-walkin/new_web_app/src/app/admin/login/page.tsx))

### `public/IRTTAA_256x256.png` & `public/IRTTAA-LOGO-1.png`
- **Use Case**: High-resolution raster images for favicons, mobile app icons, and social share previews.

### `public/style.css`
- **Use Case**: Lightweight fallback static styles for non-Tailwind asset contexts.

---

## 5. Shared Types (`src/types/`)

### `src/types/database.types.ts`
- **Use Case**: Canonical TypeScript contracts used across frontend and backend.
- **Models**:
  - `Event`: Multi-event definition (`id`, `title`, `slug`, `event_date`, `location`, `status`, `is_active`, `registration_open`).
  - `Attendee`: Walk-in and pre-registered attendee model with complete financial fields (`amount_paid`, `membership_amount`, `contribution_amount`, `checked_in`, `food_preference`).
  - `EventMetrics`: Aggregate analytics payload for the admin dashboard (total, checked-in, walk-in, total collections, membership collections, contributions).
  - `Profile`: Admin and committee user role model.

---

## 6. Layered Server Architecture (`src/server/`)

This directory implements the layered design pattern from `backend_ideas.pdf`:

```text
HTTP Request -> Controller -> Service (Business Rules) -> Repository (Supabase SQL) -> Database
```

### 1. `src/server/config/supabase.ts`
- **Use Case**: Dual-client Supabase initialization.
  - `supabase`: Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side queries and browser sessions.
  - `supabaseAdmin`: Uses `SUPABASE_SERVICE_ROLE_KEY` for server-side API routes to execute elevated tasks and administrative mutations safely.

### 2. `src/server/constants/index.ts`
- **Use Case**: Single source of truth for all business constants.
  - `DEPARTMENTS`: 9 college branches (`MECH`, `AUTO`, `ECE`, `EEE`, `CSE`, `IT`, `CIVIL`, `CTRANS`, `MCA`).
  - `BATCH_YEARS`: Reverse chronological list from 2028 down to 1988.
  - `MEMBERSHIP_OPTIONS`: Standardized subscription tiers:
    - *Life Member* (₹1,000)
    - *Patron Member* (₹5,000)
    - *Patron Upgrade* (₹4,000)
    - *None / Not Interested* (₹0)
  - `PAYMENT_MODES`: `Cash`, `UPI`, `Card`, `Online`.
  - `EVENT_STATUSES`: `draft`, `upcoming`, `ongoing`, `completed`.

### 3. `src/server/validators/`
- **`attendee.validator.ts`**:
  - `walkInRegistrationSchema`: Validates full name (min 2 chars), 10-digit mobile, valid email, department, batch year (1980-2035), food preference, and non-negative financial inputs.
  - `checkInUpdateSchema`: Validates desk updates (mobile reconciliation, paid amount, payment mode, remarks).
- **`event.validator.ts`**:
  - `eventSchema`: Validates event title, URL-safe slug regex (`/^[a-z0-9-]+$/`), `YYYY-MM-DD` date, time, and location strings.

### 4. `src/server/repositories/`
- **`attendee.repository.ts`**:
  - Direct database queries for the `attendees` table.
  - Methods: `getAttendees()`, `getAttendeeById()`, `getAttendeeByMobile()`, `insertAttendee()`, `updateAttendee()`, `deleteAttendee()`, `getEventMetrics()`.
  - Computes aggregation metrics directly in PostgreSQL.
- **`event.repository.ts`**:
  - Direct database queries for the `events` table.
  - Methods: `getAllEvents()`, `getActiveEvent()`, `getEventBySlug()`, `createEvent()`, `updateEvent()`, `deactivateAllEvents()`, `deleteEvent()`.

### 5. `src/server/services/`
- **`attendee.service.ts`**:
  - Generates standardized unique Attendee IDs: `IRTTAA-<timestamp_suffix>-<mobile_suffix>`.
  - Enforces duplicate prevention (prevents duplicate mobile numbers in the same event).
  - Automatically calculates total amounts (`membershipAmount + contributionAmount`).
  - Marks walk-in attendees as checked-in automatically on arrival.
- **`event.service.ts`**:
  - Ensures slug uniqueness across all events.
  - Enforces **active event exclusivity**: when an event is published or set to active, it automatically deactivates all other events so the Home and Registration portals have exactly one active target.

### 6. `src/server/controllers/`
- **`attendee.controller.ts`**:
  - Coordinates input validation via Zod, passes validated data to `attendeeService`, and formats responses into standard `{ success: true, data }` or `{ success: false, error }` JSON envelopes.
- **`event.controller.ts`**:
  - Coordinates event listing, creation, updates, and deletion.

---

## 7. Reusable Components (`src/components/`)

### `src/components/checkin/AttendeeCheckInCard.tsx`
- **Use Case**: The core interactive card used on the `/checkin` desk screen.
- **Features**:
  - Header displays Name, Batch Year, Department, Mobile, Food Preference, and Checked-In badge.
  - If attendee is not checked in, expands into a check-in drawer.
  - Allows volunteers to reconcile contact info, add membership subscriptions, log voluntary contributions, select payment mode (`UPI`, `Cash`, etc.), and click **"Complete Check-In & Collect ₹X"**.

### `src/components/registration/PaymentCalculator.tsx`
- **Use Case**: Modular payment calculator used in the walk-in registration flow.
- **Features**:
  - Dropdown for Alumni Association Membership (Life Member, Patron, etc.).
  - Number input for voluntary donations.
  - Dynamic payment mode selector (`UPI`, `Cash`, `Card`, `Online`).
  - Real-time recalculation of total payable amount.

### `src/components/registration/SuccessCard.tsx`
- **Use Case**: Displayed immediately after successful walk-in registration.
- **Features**:
  - Digital Event Badge with attendee name, batch, department, attendee ID, and food preference.
  - Contains **"Print Badge Pass"** button (triggers browser print stylesheet).
  - Contains **"Register Another Walk-In"** button to reset the form for the next alumnus in line.

---

## 8. App Router Pages & API Routes (`src/app/`)

### 1. Global Setup
- **`globals.css`**: Tailwind CSS v4 directives, customized colors (IRTTAA teal & amber), plus `@media print` rules that hide navbar/buttons and format the attendee badge card cleanly on physical paper.
- **`layout.tsx`**: Sets page metadata, title `"IRTTAA NuzhAI - Alumni Association Event Portal"`, and applies Google Inter font.

### 2. Pages
- **`page.tsx` (`/`)**:
  - Landing page.
  - Dynamically fetches `/api/events/active` to display current event title, date, time, and location.
  - Provides two prominent cards: **"Walk-In Registration"** and **"Search & Desk Check-In"**, plus top-right navigation to the Admin Portal.
- **`register/page.tsx` (`/register`)**:
  - Full self-service registration form for alumni arriving on-spot.
  - Form sections: Personal Details, Academic Details (Batch 1988-2028, 9 Departments), Food Preference, Family Count, and the `PaymentCalculator`.
  - Replaces the form with `SuccessCard` upon submission.
- **`checkin/page.tsx` (`/checkin`)**:
  - Volunteer desk operations portal.
  - Instant search bar (searches Mobile, Name, or Attendee ID).
  - Quick dropdown filters for Batch Year, Department, and Payment Status.
  - Live check-in count and collection counters.
  - Renders results using `AttendeeCheckInCard`.
- **`admin/login/page.tsx` (`/admin/login`)**:
  - Secure login screen supporting Supabase Auth and default organizer access (`admin@irttaa.org` / `admin123`).
  - Includes a 1-click **"Organizer Quick Access (Demo)"** button for instant testing.
- **`admin/page.tsx` (`/admin`)**:
  - Full-featured Admin Dashboard with 3 tabs:
    1. **Overview & Live Analytics**: Real-time KPI metric cards (Total Attendees, Checked-In Rate, Walk-In vs Pre-Registered, Total Revenue, Membership Collections, Donations), plus Batch and Department distribution charts.
    2. **Attendee Directory**: Full data table with live search, batch/dept filters, inline editing modal, single attendee deletion, and **"Export CSV"** button for downloading reports.
    3. **Events Manager**: Create new alumni meets, edit date/location, and set any event as the active meet with the **"Set as Active"** button.

### 3. API Routes
- **`POST /api/register`**: Receives walk-in registration form data, validates with Zod, and creates the attendee in Supabase.
- **`GET /api/checkin/search`**: Accepts query parameters (`search`, `batchYear`, `stream`, `paymentStatus`, `checkedIn`) and returns matching attendees.
- **`POST /api/checkin/[attendeeId]`**: Updates attendee record with payment reconciliation and sets `checked_in: true` with a timestamp.
- **`GET /api/events/active`**: Fetches the currently active meet for the Home and Registration portals.
- **`GET /api/admin/events` & `POST /api/admin/events`**: Lists all events and handles posting new chapter meets.
- **`PATCH & DELETE /api/admin/events/[eventId]`**: Updates event parameters (such as activating an event) or removes old events.
- **`GET /api/admin/dashboard`**: Aggregates all KPI counters, batch breakdown, and department breakdown.
- **`PATCH & DELETE /api/admin/attendees/[attendeeId]`**: Updates attendee details (name, batch, department, phone) or deletes an attendee record.

---

## 9. Life of a Request (Architecture Diagram)

```
=============================================================================
                          WALK-IN REGISTRATION FLOW
=============================================================================

Alumnus at Venue
       │
       ▼
 [Browser: /register] ──── User submits Name, Mobile, Batch, Fee Choice
       │
       ▼
 [POST /api/register]
       │
       ▼
 [AttendeeController] ──── Validates payload with Zod (walkInRegistrationSchema)
       │
       ▼
 [AttendeeService]    ──── 1. Checks mobile uniqueness
                      ──── 2. Calculates total (Membership + Contribution)
                      ──── 3. Generates Attendee ID (IRTTAA-xxxxxx-xxxx)
                      ──── 4. Sets checked_in = TRUE, checked_in_at = NOW()
       │
       ▼
 [AttendeeRepository] ──── Performs INSERT into Supabase `public.attendees`
       │
       ▼
 [Supabase Database]
       │
       ▼
 [Browser: SuccessCard] ── Renders Digital Badge & Enables Pass Printing

=============================================================================
                           DESK CHECK-IN FLOW
=============================================================================

Desk Volunteer
       │
       ▼
 [Browser: /checkin]  ──── Types Mobile or Name into Search Bar
       │
       ▼
 [GET /api/checkin/search?search=90669]
       │
       ▼
 [AttendeeController] ──> [AttendeeService] ──> [AttendeeRepository]
       │
       ▼
 [Supabase Database]  ──── Returns matching attendee cards
       │
       ▼
 [AttendeeCheckInCard] ── Volunteer expands card, updates fee, clicks Check-In
       │
       ▼
 [POST /api/checkin/:id]
       │
       ▼
 [AttendeeService]    ──── Reconciles amount paid, marks checked_in = TRUE
       │
       ▼
 [Supabase Database]  ──── Updates row in `public.attendees`
       │
       ▼
 UI Updates Instantly ──── Card turns green with "Checked In" badge
```

---

## 10. Summary Matrix

| Layer / Directory | Primary Responsibility | Key Files |
| :--- | :--- | :--- |
| **`data/`** | Benchmark dataset & test fixtures | `example_attendees_data.csv` |
| **`public/`** | Logos, SVG emblems, badge pass assets | `logo.png`, `logo.svg`, `IRTTAA_256x256.png` |
| **`src/types/`** | TypeScript data models & contracts | `database.types.ts` |
| **`src/server/config/`** | Database connectivity & credentials | `supabase.ts` |
| **`src/server/constants/`**| Business enums, fee plans, branches | `index.ts` |
| **`src/server/validators/`**| Runtime safety & payload verification | `attendee.validator.ts`, `event.validator.ts` |
| **`src/server/repositories/`**| SQL query abstraction & data persistence | `attendee.repository.ts`, `event.repository.ts` |
| **`src/server/services/`**| Business calculations, ID logic, rules | `attendee.service.ts`, `event.service.ts` |
| **`src/server/controllers/`**| Request parsing & response packaging | `attendee.controller.ts`, `event.controller.ts` |
| **`src/components/`** | Reusable UI widgets & modals | `AttendeeCheckInCard.tsx`, `PaymentCalculator.tsx`, `SuccessCard.tsx` |
| **`src/app/`** | Next.js App Router pages & API routes | `/register`, `/checkin`, `/admin`, `/api/*` |
