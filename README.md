# GrowthAgent

An autonomous marketing pipeline that scrapes live events, generates qualified leads, and writes personalized outreach — powered by Claude AI.

## What It Does

1. **Setup** — Enter a description of your company (what you do, who you serve)
2. **Pipeline** — The AI agent scrapes real Luma events via Apify and categorizes organizers as Customers, Sponsors, B2B, or Partners
3. **Results** — Browse discovered leads with fit scores (50–99), a reason they match, and previews of outreach messages
4. **Outreach Studio** — Edit personalized emails, LinkedIn DMs, and Instagram DMs per lead; run a "test pitch" to simulate the prospect's response and auto-refine the message
5. **Launch** — Approve leads and auto-create campaign tasks in RoryPlans

The pipeline also generates 7 days of LinkedIn posts and Instagram captions, plus an agent self-review of output quality.

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router 6, Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack React Query |
| Forms | React Hook Form + Zod |
| Backend | Supabase Edge Functions (Deno runtime) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Scraping | Apify (Luma events) |
| Tasks | RoryPlans API |

## Project Structure

```
src/
├── pages/
│   ├── Setup.tsx              # Company description input
│   ├── Pipeline.tsx           # Animated pipeline progress
│   ├── ResultsDashboard.tsx   # Lead cards by category
│   └── OutreachStudio.tsx     # Per-lead editor + test pitch
├── components/
│   └── agent/
│       └── TestPitchModal.tsx # AI prospect simulation + refinement
├── lib/
│   └── agentStore.ts          # Zustand store (leads, company desc, state)
└── integrations/supabase/     # Supabase client + generated types

supabase/functions/
├── generate-leads/            # Main pipeline (Claude + Apify)
├── simulate-pitch/            # Test pitch & refinement (Claude)
└── create-roryplan/           # RoryPlans task creation
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Supabase project
- API keys for Anthropic, Apify, and RoryPlans

### Installation

```bash
git clone https://github.com/aneessaheba/growth-agent-nexus-62
cd growth-agent-nexus-62
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PROJECT_ID=<your-project-id>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Set these secrets in your Supabase project dashboard (under Edge Functions → Secrets):

```
ANTHROPIC_API_KEY
APIFY_API_KEY
RORYPLANS_API_KEY
```

### Run

```bash
npm run dev        # Dev server at http://localhost:8080
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run test       # Run tests
```

### Deploy Edge Functions

```bash
supabase functions deploy generate-leads
supabase functions deploy simulate-pitch
supabase functions deploy create-roryplan
```

## Lead Object Shape

```typescript
{
  id: string;
  category: "customers" | "sponsors" | "b2b" | "partners";
  name: string;
  company: string;
  score: number;          // 50–99
  why_fit: string;
  email: string;
  linkedin_dm: string;
  instagram_dm: string;
}
```

## License

MIT
