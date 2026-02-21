# Ship My Dissertation (shipmydiss)

## What is this?

A micro-SaaS web app that helps UK undergraduate students project-manage their dissertations and major assignments. It applies real project management methodology to academic work — generating personalised plans, sending weekly check-ins, flagging risks, and dynamically adjusting timelines.

**Critical positioning:** This is a PLANNING tool, not a content generation tool. It never writes, paraphrases, or generates academic content. It manages the *process*. This distinction is fundamental to the product's integrity and marketability to universities.

## Target User

UK undergraduates (18-22) doing final-year dissertations or major projects (3,000-15,000 words). They're motivated but disorganised. They've never managed a project this long before. They'll pay £4.99/mo or £29.99/year to reduce anxiety and stay on track.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js (email magic link + Google OAuth)
- **Database:** PostgreSQL via Supabase (free tier to start)
- **AI Layer:** Anthropic Claude API (claude-sonnet-4-5-20250929) for plan generation and check-in conversations
- **Notifications:** Email via Resend (free tier: 100 emails/day)
- **Payments:** Stripe (monthly + annual plans)
- **Hosting:** Vercel (free tier to start)
- **Cron Jobs:** Vercel Cron for weekly check-in triggers

## Project Structure

```
shipmydiss/
├── CLAUDE.md
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── onboarding/
│   │   │   └── page.tsx                # Project setup wizard
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Main dashboard
│   │   │   ├── plan/page.tsx           # Detailed plan view
│   │   │   ├── checkin/page.tsx        # Weekly check-in flow
│   │   │   └── settings/page.tsx       # Account & project settings
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── plan/
│   │       │   ├── generate/route.ts   # AI plan generation
│   │       │   └── adjust/route.ts     # AI plan adjustment
│   │       ├── checkin/
│   │       │   ├── submit/route.ts     # Process check-in
│   │       │   └── cron/route.ts       # Weekly trigger (Vercel Cron)
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts
│   │       │   └── webhook/route.ts
│   │       └── export/
│   │           └── transparency/route.ts  # AI transparency log export
│   ├── components/
│   │   ├── ui/                         # Reusable UI components
│   │   ├── onboarding/                 # Wizard steps
│   │   ├── dashboard/                  # Dashboard widgets
│   │   └── checkin/                    # Check-in flow components
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── prompts.ts             # System prompts for Claude
│   │   │   ├── plan-generator.ts      # Plan generation logic
│   │   │   └── checkin-engine.ts      # Check-in conversation logic
│   │   ├── db.ts                      # Prisma client
│   │   ├── auth.ts                    # NextAuth config
│   │   ├── stripe.ts                  # Stripe helpers
│   │   └── email.ts                   # Email templates
│   └── types/
│       └── index.ts                   # Shared TypeScript types
└── public/
    └── ...
```

## Data Model (Core)

```
User
  - id, email, name
  - stripeCustomerId, subscriptionStatus
  - createdAt

Project (a user can have multiple — dissertation + assignments)
  - id, userId
  - title, type (dissertation | assignment | project)
  - wordCount, deadline
  - weeklyHoursAvailable
  - methodology (qualitative | quantitative | mixed | not_sure)
  - currentPhase
  - createdAt

Milestone
  - id, projectId
  - title, description
  - phase (lit_review | methodology | data_collection | analysis | drafting | editing | submission)
  - targetDate, completedDate
  - status (upcoming | in_progress | completed | overdue | adjusted)
  - order

CheckIn
  - id, projectId
  - weekNumber
  - status (pending | completed | skipped)
  - completedTasks (JSON)
  - blockers (text)
  - moodRating (1-5)
  - aiResponse (text — the personalised feedback)
  - planAdjustments (JSON — any changes made)
  - createdAt

AIInteractionLog (for transparency export)
  - id, projectId
  - interactionType (plan_generation | checkin | plan_adjustment)
  - userInput (text)
  - aiOutput (text)
  - createdAt
```

## AI System Prompts — Key Design Principles

The AI layer is the core differentiator. The system prompts must embody genuine PM methodology:

1. **Plan Generation Prompt:** Takes project details and generates a backward-planned schedule. Must account for:
   - Dependencies between phases (can't analyse data you haven't collected)
   - Realistic time estimates per phase based on word count and methodology
   - Buffer time (at least 15% of total time)
   - Student's other commitments (exam periods, holidays)
   - The fact that students WILL procrastinate — front-load critical decisions

2. **Check-In Prompt:** Conversational, supportive but honest. Asks what they've done, identifies blockers, and adjusts the plan. Must:
   - Be concise and not patronising
   - Match Gen Z communication style (direct, slightly informal)
   - Flag genuine risks clearly ("you're 2 weeks behind on lit review — here's what that means for your deadline")
   - Never generate academic content — redirect to supervisor for content questions
   - Celebrate progress genuinely

3. **NEVER do any of the following:**
   - Write, draft, or suggest academic content
   - Recommend specific sources or references
   - Evaluate academic quality of their work
   - Anything that could be construed as academic dishonesty

## Weekend Build Plan

### Saturday Morning (4 hrs): Foundation
- [ ] Init Next.js project with TypeScript + Tailwind
- [ ] Set up Supabase project + Prisma schema
- [ ] Implement NextAuth with magic link
- [ ] Create basic layout + navigation

### Saturday Afternoon (4 hrs): Core Flow
- [ ] Build onboarding wizard (5 steps: project type → topic → deadline → hours → methodology)
- [ ] Implement AI plan generation endpoint (Claude API)
- [ ] Create dashboard showing generated plan as timeline
- [ ] Display milestones with status indicators

### Sunday Morning (4 hrs): Check-in System
- [ ] Build weekly check-in flow (conversational UI)
- [ ] Implement plan adjustment logic
- [ ] Set up Vercel Cron for weekly email triggers
- [ ] Create email templates (Resend)

### Sunday Afternoon (4 hrs): Polish + Payments
- [ ] Integrate Stripe checkout (monthly + annual)
- [ ] Build AI transparency log export (PDF)
- [ ] Add landing page (port the existing HTML)
- [ ] Deploy to Vercel
- [ ] Test end-to-end flow

## Design Direction

- Dark theme (matches the landing page aesthetic)
- Gen Z friendly — casual copy, emoji where appropriate, no corporate speak
- Mobile-first (students live on their phones)
- Minimal chrome — the plan/timeline is the hero of the dashboard
- Progress visualisation that feels satisfying (progress bars, streaks)

## Environment Variables Required

```
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_ANNUAL=
RESEND_API_KEY=
```

## Commands

```bash
npm run dev          # Start development server
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Visual database browser
```

## Key Decisions & Rationale

- **Why Next.js?** Full-stack in one framework. API routes + SSR + easy Vercel deploy. Fastest path to production for a solo dev.
- **Why Supabase?** Free Postgres with a generous free tier. Prisma as ORM means we're not locked in.
- **Why magic link auth?** Students hate making passwords. Google OAuth as backup.
- **Why Resend?** Free tier covers MVP. Simple API. Good deliverability.
- **Why Claude over GPT?** Better at structured planning tasks, more natural conversational tone, and the developer already has experience with the Anthropic API.
