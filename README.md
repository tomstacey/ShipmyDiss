# Ship My Dissertation

> AI-powered project management for UK undergraduates tackling their dissertation or major assignment.

**Marketing site:** https://tomstacey.github.io/ShipmyDiss/
**App (coming soon):** https://app.shipmydiss.com

---

## What is this?

Ship My Dissertation applies real project management methodology to academic work — generating personalised plans, sending weekly check-ins, flagging risks, and dynamically adjusting timelines.

**Critical positioning:** This is a PLANNING tool, not a content generation tool. It never writes, paraphrases, or generates academic content.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Auth:** NextAuth.js v5 (magic link + Google OAuth)
- **Database:** PostgreSQL via Supabase + Prisma ORM
- **AI:** Anthropic Claude API
- **Email:** Resend
- **Payments:** Stripe
- **Hosting:** Vercel (app) + GitHub Pages (marketing)

## Development Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in your credentials before running.

## Project Structure

```
/
├── index.html          # Marketing site (served by GitHub Pages)
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── lib/            # Auth, DB, AI helpers
│   └── types/          # TypeScript types
├── prisma/
│   └── schema.prisma   # Database schema
├── CLAUDE.md           # AI assistant instructions
└── PRD.md              # Product requirements
```

## Environment Variables

See `.env.local.example` for all required variables.
