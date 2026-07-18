# carOS

A vehicle management app: track your vehicles, maintenance history, and renewal reminders — with AI that reads workshop receipts and identifies cars from photos.

Built with Next.js 16, shadcn/ui, Supabase (Postgres, Auth, Storage), and the Claude API.

## Features

- **Garage dashboard** — all your vehicles with photos, mileage, and upcoming reminders
- **AI vehicle detection** — upload a photo when adding a vehicle and the make, model, year, colour, and license plate are filled in automatically
- **Maintenance log** — services, costs, parts replaced, mechanic details, and attachments per vehicle
- **AI receipt scanner** — snap a workshop receipt or invoice (image or PDF) and the record fills itself in
- **Reminders** — road tax, insurance, servicing, and more, sorted by urgency
- **Multi-user** — each account only ever sees its own data (Postgres row-level security), with email or Google sign-in

## Running it yourself

You'll need [Node.js](https://nodejs.org) 20 or newer, a free [Supabase](https://supabase.com) account, and an [Anthropic API key](https://console.anthropic.com) (only needed for the two AI features).

### 1. Clone and install

```bash
git clone https://github.com/mc86pk5hdr-cell/carOS.git
cd carOS
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**, then run each file in [`supabase/migrations/`](supabase/migrations) **in order** (0001 → 0005): paste the contents of one file, click **Run**, then repeat in a fresh query for the next. This creates all tables, security policies, and storage buckets.
3. Go to **Project Settings → API** and copy the *Project URL* and *anon public* key.

Google sign-in is optional; the app works with email/password out of the box. To enable it, follow [Supabase's Google auth guide](https://supabase.com/docs/guides/auth/social-login/auth-google).

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your anon key
ANTHROPIC_API_KEY=your Anthropic key (optional — AI features only)
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and add your first vehicle.

## Notes

- Without an `ANTHROPIC_API_KEY`, everything works except receipt scanning and vehicle photo detection.
- The AI features call the Claude API server-side; usage is billed to your Anthropic account per scan.
- Default currency for maintenance costs is BND, selectable per record.
