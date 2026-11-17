# Freebbonize

A modern, lightweight, and open-source **Twibbon Generator & Campaign Platform** — create custom event frames, share unique links, and let participants composite their photos with dynamic captions in seconds without any login or registration.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **PostgreSQL**, and **Supabase Storage**, styled following the **Raycast Dark Midnight Command Center** design system.

---

## ✨ Features

- **No-Login Campaign Creation (`/`)** — Anyone can launch a new Twibbon campaign in seconds:
  - Set a custom URL slug (e.g. `freebbonize.com/fancy-event-2026`).
  - Real-time debounced slug availability checking against PostgreSQL.
  - Custom event title, description, and dynamic social media caption template with variables (e.g. `[name]`, `[institution]`).
- **Dynamic Campaign Routing (`/:slug`)** — Each campaign gets its own dedicated, shareable page:
  - Displays the campaign's custom frame, title, description, and dynamic caption form.
  - One-click link copying and quick "Create New Twibbon" navigation.
- **Flexible Aspect Ratio (No Forced 1:1 Crop)** — Twibbon frames are no longer locked to square format:
  - Supports portrait (4:5, 9:16), landscape (16:9), square (1:1), or any arbitrary dimension.
  - High-resolution rendering based on the frame's natural dimensions.
  - Smooth 2D HTML5 Canvas interaction: drag to reposition, scale ($10\% - 250\%$), and rotate ($-180^\circ$ to $180^\circ$).
- **Strict Backend File Validator** — Multi-layered file security:
  - Binary magic-byte header inspection (PNG, JPEG, WEBP) to prevent extension spoofing.
  - Strict 3MB size limit.
  - Whitelist of allowed image extensions (`.png`, `.jpg`, `.jpeg`, `.webp`).
  - Implemented as both Vite server middleware (`/api/validate-frame`) and Supabase Edge Function (`supabase/functions/upload-frame`).
- **Cloud Storage & Database** — Backed by Supabase Storage (public CDN bucket) and PostgreSQL with Row-Level Security (RLS) for seamless anonymous reading and publishing.
- **Raycast Midnight Design System** — Austere dark cockpit aesthetic:
  - Void Black (`#040506`) dominant canvas, Ink (`#07080a`) tactile cards with key-shadow elevation, Obsidian (`#111214`) recessed inputs, and Azure Pulse (`#4d8bff`) brand accent.
  - Neutral Mist (`#e6e6e6`) primary action buttons.
  - Clean Inter typography paired with JetBrains Mono for slugs, tags, and micro-labels.
- **Complete Favicon Suite** — Fully integrated webmanifest, apple-touch-icon, and multi-size PNG/ICO favicons.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [React Router](https://reactrouter.com/)
- **Build Tool:** [Vite 8](https://vite.dev/) (with React Compiler enabled)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [lucide-react](https://lucide.dev/)
- **Database:** PostgreSQL (with triggers, stored generated columns, and RLS)
- **Storage:** Supabase Storage (Public CDN Bucket)
- **Package Manager:** [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/GithubFarelAlghazali/freebbonize.git
cd freebbonize
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

Ensure the following variables are set:
```env
# Supabase Client Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_STORAGE_BUCKET=freebbonize-files

# Supabase Server / Backend Configuration (Keep confidential!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
MAX_FILE_SIZE_BYTES=3145728

# Native Postgres Database URL (for migrations & seeders)
DATABASE_URL=postgresql://postgres:password@your-db-host:5432/postgres

# App URL
VITE_APP_URL=http://localhost:5173
```

### 4. Database Setup
Apply migrations and seeders to your PostgreSQL / Supabase database:
```bash
# Apply schema and RLS policies
psql "$DATABASE_URL" -f supabase/migrations/20261117140000_create_campaigns_and_analytics.sql
psql "$DATABASE_URL" -f supabase/migrations/20261117143000_storage_policies.sql

# (Optional) Seed sample campaigns
psql "$DATABASE_URL" -f supabase/seed.sql
```

### 5. Start the development server
```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

---

## 📋 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server with backend validator middleware |
| `pnpm build` | Type-check and build production bundle |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint with zero-warning standard |

---

## 📁 Project Structure

```
freebbonize/
├── public/                      # Static assets & full favicon suite
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-*.png
│   ├── site.webmanifest
│   └── twibbon.png              # Fallback sample twibbon frame
├── server/                      # Local / Vite dev server backend validator
│   └── validator.ts             # Binary magic bytes & file size check
├── src/
│   ├── components/
│   │   ├── landing-page.tsx     # Step 1: photo upload sidebar
│   │   ├── adjust-page.tsx      # Step 2: scale & rotate sliders
│   │   ├── download-page.tsx    # Step 3: dynamic caption form & PNG download
│   │   └── twibbon-canvas.tsx   # Multi-aspect ratio canvas & drag logic
│   ├── lib/
│   │   ├── file-validator.ts    # Binary magic-byte inspection & dimension extractor
│   │   └── supabase.ts          # Supabase client initialization & types
│   ├── pages/
│   │   ├── CreateCampaignPage.tsx # Route '/': No-login campaign creation form
│   │   ├── CampaignViewPage.tsx   # Route '/:slug': Dynamic participant twibbon page
│   │   └── NotFoundPage.tsx       # Route '*': 404 fallback page
│   ├── App.css                  # Raycast design tokens & component utilities
│   ├── App.tsx                  # Declarative React Router setup
│   └── main.tsx
├── supabase/
│   ├── functions/
│   │   └── upload-frame/        # Supabase Edge Function for upload validation
│   ├── migrations/              # PostgreSQL DDL migrations & storage RLS policies
│   └── seed.sql                 # Sample campaign seeders (1:1, 4:5, 16:9)
├── DevReferences/               # PRD, Implementation plans & Design skills
├── .env.example
├── package.json
└── vite.config.ts
```

---

## 📄 License

Licensed under the [MIT License](./LICENSE).
