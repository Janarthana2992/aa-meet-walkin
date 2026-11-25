# IRTTAA NuzhAI — Alumni Meet Event Portal

**IRTTAA NuzhAI** is the official multi-event alumni registration, venue check-in, payment reconciliation, and analytics web portal built for the **Institute of Road and Transport Technology Alumni Association (IRTTAA)**.

It replaces manual event-day spreadsheets with an automated, mobile-friendly venue check-in flow that links official IRTTAA association records, website pre-registrations, batch-based fee configurations, voluntary contributions, and live financial reporting.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling & Motion**: Tailwind CSS v4 (`@tailwindcss/postcss`), Framer Motion, Lucide React
- **Validation & CSV Engine**: Zod + custom RFC-4180 CSV parser & data normalizer
- **Database & Auth**: Supabase (PostgreSQL 17, Row Level Security, Supabase Auth)
- **Architecture**: Clean Layered Backend (`controllers` → `services` → `repositories` → `validators` → `config`) — see [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)

---

## Core Features & User Flows

### 1. Multi-Event & Batch Fee Engine (Admin)
- Create and manage multiple chapter meets, annual meets, or special events (`events`).
- Switch the active portal event in one click — the Home page (`/`) and Registration form (`/register`) update dynamically.
- Default batch fee rules are automatically seeded per event in `event_fee_configurations` and can be customized per event:
  - **1988 – 2000**: ₹500
  - **2001 – 2010**: ₹400
  - **2011 – 2020**: ₹300
  - **2021 – 2027**: ₹0 (Free Entry)

### 2. CSV Master & Pre-Registration Importers (Admin)
- **Association Members (`IRTT_AA_Members.csv`)**: Upload anytime to append newly registered members and automatically update existing members (e.g., membership tier upgrades `REGISTERED_MEMBER` → `LIFE_MEMBER` / `PATRON_MEMBER`). Normalizes courses (`B.E. → BE`), streams, and phone numbers.
- **Event Pre-Registrations (`event_pre_registrations.csv`)**: Upload website registration exports directly into any selected event. The system automatically assigns `event_id` to every row, maps accompanying counts into `accompanying_family_count`, and prevents duplicate rows on re-import via `UNIQUE (event_id, email)`.

### 3. Unified Venue Registration & Smart Autofill (`/register`)
When an alumnus arrives at the event venue and enters their **Email** or **Mobile Number**:
1. **Duplicate Check-In Guard**: If already checked in (`event_registrations`), immediately displays their existing printable pass.
2. **Pre-Registration Autofill**: Checks `event_pre_registrations` for the active event and pre-fills all profile/food/family details (`PRE_REGISTERED`), editable before submit.
3. **Association Member Fallback**: If not pre-registered, checks `association_members`, marks `recognized_member = true`, and pre-fills academic & contact info (`ON_SPOT`).
4. **Manual On-Spot Entry**: If new to both tables, lets the alumnus fill out the complete form (`UNREGISTERED_MEMBER`, `ON_SPOT`).
5. **Fee + Contribution + QR Payment**:
   - System auto-fills the **Registration Fee** based on Graduating Batch Year.
   - Alumnus can optionally enter a **Voluntary Contribution**.
   - When total payable > ₹0, displays *"Kindly do the payment using QR code on the table then Submit it."*, lets them select **`ONLINE`** (requires 4-digit **UPI/UTR reference `utr_last4`**) or **`CASH`**, and issues a printable **Digital Event Pass** (`IRTTAA-0001`).

### 4. Volunteer Desk Directory (`/checkin`) & Admin Analytics (`/admin`)
- **`/checkin`**: Live two-column view showing **Awaiting Check-In** pre-registrations alongside **Checked In** passes, with 1-click launch into `/register?q=...`.
- **`/admin`**: 5-tab management dashboard:
  1. **Overview & Analytics**: Live Venue Check-Ins, Total Headcount (including family/alumni), **Total Collected**, **Registration Fees vs Voluntary Contributions**, **Online vs Cash** split, Catering counts, and Batch/Stream distribution charts.
  2. **Venue Registrations**: Search, filter, edit, delete, and export registrations to CSV.
  3. **Events & Fee Rules**: Create/activate/delete events and edit batch fee configurations.
  4. **Pre-Registrations Import**: Upload `event_pre_registrations.csv` per event.
  5. **Association Members**: Upload `IRTT_AA_Members.csv` and search the member directory.

---

## Database Schema

The PostgreSQL schema lives in [`data/DataBase_design/001_nuzhai_schema.sql`](./data/DataBase_design/001_nuzhai_schema.sql) and includes 5 core tables:

| Table | Purpose |
| :--- | :--- |
| `association_members` | Master list of recognized IRTTAA members imported from CSV (`PK: member_login_id`, `UNIQUE: email`) |
| `events` | Chapter events and annual meets (`PK: event_id`, `event_date`, `event_time`, `venue`, `is_active`) |
| `event_fee_configurations` | Per-event fee rules driven by graduating year range & membership type |
| `event_pre_registrations` | Website pre-registration records scoped per event (`UNIQUE: (event_id, email)`) |
| `event_registrations` | Immutable event-day check-in & payment snapshot (`UNIQUE: (event_id, email)`) |

---

## Local Setup Guide

### 1. Prerequisites
- **Node.js** 18.x or 20.x+ and **npm**
- A **Supabase** project

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/sanum66/aa-meet-walkin.git
cd aa-meet-walkin
git checkout irttaa_nuzhai_app
cd new_web_app
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and enter your Supabase project credentials:
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Initialize the Supabase Database
1. Open your **Supabase Dashboard → SQL Editor**.
2. Copy the entire contents of [`data/DataBase_design/001_nuzhai_schema.sql`](./data/DataBase_design/001_nuzhai_schema.sql) and run it.
3. This creates all 8 enums, 5 tables, indexes, `updated_at` triggers, Row Level Security policies, and grants.

### 5. Run the Application
```bash
# Development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

For a production build:
```bash
npm run build
npm run start
```

---

## Routes & Admin Credentials

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Dynamic active event landing page & portal links |
| `/register` | Public | Venue lookup (`?q=`), registration form, fee/QR UTR & pass |
| `/checkin` | Desk / Public | Volunteer desk directory (Awaiting vs Checked-In passes) |
| `/admin/login` | Admin | Login via Supabase Auth user or organizer quick access |
| `/admin` | Protected | 5-tab Events, Fees, CSV Importers, Directory & Analytics |

**Default Admin Demo Login (`/admin/login`)**:
- **Email**: `admin@irttaa.org` *(or `admin`)*
- **Password**: `admin123`
- Or click **"Organizer Quick Access (Demo)"** on `/admin/login`, or log in with any user created in **Supabase Dashboard → Authentication → Users**.

---

## Testing With Sample CSV Data

Sample datasets are included in [`data/Example_data/`](./data/Example_data):
1. Log into **`/admin/login`** → go to **Events & Fee Rules** → create an event (e.g., *Salem Chapter Meet 2026*).
2. Go to **Association Members** → upload [`IRTT_AA_Members.csv`](./data/Example_data/IRTT_AA_Members.csv) (26 records).
3. Go to **Pre-Registrations Import** → select your event and upload [`event_pre_registrations.csv`](./data/Example_data/event_pre_registrations.csv) (19 records).
4. Open **`/register`** and test all 3 venue journeys:
   - **Pre-Registered**: Search `9597247891` or `msanthosh66@gmail.com` (Batch `2013` → ₹300 fee)
   - **Recognized Association Member**: Search `prabhu1274@gmail.com` (Batch `1995` → ₹500 fee)
   - **Free Entry / Walk-In**: Enter a new email and select Batch `2024` (₹0 Free Entry)
5. Return to **`/admin` → Overview & Analytics** to inspect live check-ins, fee vs contribution totals, `ONLINE` (with UTR) vs `CASH` totals, and batch/stream breakdowns.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port `3000` |
| `npm run build` | Builds the optimized production bundle |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npx tsc --noEmit` | Runs full TypeScript static type checking |

---

## Further Documentation
- See [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) for a detailed file-by-file breakdown of every folder, repository, service, controller, component, and API endpoint.
