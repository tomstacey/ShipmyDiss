# Ship My Dissertation — Product Requirements Document

## 1. Product Overview

**Ship My Dissertation** (shipmydiss) is a subscription web app that helps UK undergraduates project-manage their dissertations and major assignments using AI-powered planning, weekly check-ins, and dynamic schedule adjustment.

The core insight: students don't fail dissertations because they lack intelligence — they fail because they've never managed a 6-12 month project before and nobody teaches them how. This product applies genuine project management methodology to academic work, wrapped in a student-friendly interface.

### 1.1 What This Product IS
- A project planning and tracking tool for academic work
- An AI-powered PM assistant that generates realistic schedules
- A weekly accountability system with dynamic plan adjustment
- A process and planning tool that teaches transferable skills

### 1.2 What This Product IS NOT
- An essay mill or content generator
- A writing assistant or grammar checker
- A research tool or source finder
- A replacement for academic supervision

This distinction is non-negotiable and must be enforced at every layer — UI copy, AI prompts, marketing, and FAQ.

---

## 2. User Personas

### Primary: "Anxious Anna" (70% of users)
- Final-year undergrad, 20-21 years old
- Knows she needs to start her dissertation but feels paralysed
- Has never managed a long-term project independently
- Would describe herself as "a bit disorganised"
- Willing to pay for something that reduces anxiety
- Checks her phone 150+ times a day

### Secondary: "Last-Minute Luke" (20% of users)
- Already behind on his dissertation timeline
- Looking for a recovery plan, not a fresh start
- Needs honest, non-judgmental assessment of what's still possible
- More likely to find the app mid-year than at the start

### Tertiary: "Organised Olivia" (10% of users)
- Already has a rough plan but wants structure and accountability
- Values the check-in system more than the initial planning
- Most likely to complete the full cycle and leave a positive review
- Potential advocate who recommends to friends

---

## 3. Core User Flows

### 3.1 Onboarding (First-Time Experience)

**Goal:** Get the student from sign-up to seeing their personalised plan in under 5 minutes.

**Step 1: Sign Up**
- Magic link email (primary) or Google OAuth
- No password creation — reduce friction
- Capture first name only at signup

**Step 2: Project Setup Wizard (5 screens)**

Screen 1 — Project Type:
- "What are you working on?" → Dissertation / Major Project / Extended Essay / Other
- Selection determines default phases and terminology

Screen 2 — The Basics:
- Project title or topic (free text)
- Target word count (dropdown: 5k / 8k / 10k / 12k / 15k / Other)
- Submission deadline (date picker)

Screen 3 — Your Time:
- "How many hours per week can you realistically dedicate to this?" (slider: 2-30 hrs)
- "Are there any weeks you definitely can't work?" (holiday picker)
- "Do you have other major deadlines coming up?" (optional date entries)

Screen 4 — Methodology:
- "What kind of research are you doing?" → Qualitative / Quantitative / Mixed Methods / Literature-Based / Not Sure Yet
- This significantly affects the plan structure (data collection phase varies hugely)

Screen 5 — Where Are You Now?:
- "Have you started yet?" → Not yet / Chosen my topic / Started reading / Have a proposal / Already collecting data
- This determines the plan start point — critical for "Last-Minute Luke"

**Step 3: Plan Generation**
- Loading screen with encouraging micro-copy while AI generates plan
- Suggested copy: "Building your plan... (this is the hardest part and you've already done it)"
- Display generated plan as a visual timeline

### 3.2 Dashboard (Returning User)

The dashboard is the home screen. It should answer three questions instantly:
1. "Am I on track?" (overall status indicator — green/amber/red)
2. "What should I be doing this week?" (current milestone detail)
3. "When's my next check-in?" (countdown)

**Dashboard Components:**
- Status banner (on track / slightly behind / at risk / critical)
- Current phase card with this week's focus
- Timeline visualisation showing all milestones (scrollable, mobile-friendly)
- Progress stats (% complete, weeks remaining, hours logged)
- Quick action: "Log some work" or "I'm stuck"

### 3.3 Weekly Check-In

Triggered by email notification (Sunday evening — gives them Monday to act). Also accessible from dashboard at any time.

**Check-In Flow (conversational, not form-like):**

1. "How's it going this week?" — Mood rating (5 emoji scale, from 😫 to 🚀)

2. "What did you get done?" — Checklist of this week's planned tasks (tick what's done) + free text for anything extra

3. "Anything blocking you?" — Common blockers as quick-select:
   - "Waiting on supervisor feedback"
   - "Can't find enough sources"
   - "Don't understand the methodology"
   - "Other commitments took over"
   - "Honestly, I just didn't do it"
   - Free text option

4. AI Response — Personalised feedback based on:
   - What was completed vs planned
   - Cumulative progress against overall timeline
   - Nature of blockers
   - Mood trend over recent weeks
   - Any necessary plan adjustments

5. Updated Plan — If adjustments are needed, show clearly:
   - What moved and why
   - Impact on final deadline buffer
   - Whether the situation is recoverable (always be honest)

### 3.4 AI Transparency Log Export

Available from settings at any time. Generates a PDF containing:
- Every AI interaction (plan generation, check-ins, adjustments)
- Clear labels showing what the AI did (planning only, no content)
- Timestamped log suitable for university submission
- Introductory paragraph explaining the tool's scope

---

## 4. AI Behaviour Specification

### 4.1 Plan Generation

**Input:** Project details from onboarding wizard.

**Output:** A structured plan with 8-15 milestones, each containing:
- Title and description
- Target completion date
- Estimated hours
- Dependencies (which milestones must be done first)
- Deliverable (what "done" looks like)

**Planning Rules (encode PM best practices):**
- Always backward-plan from deadline
- Include minimum 2-week buffer before submission (editing + unexpected issues)
- Lit review should be 20-25% of total time for dissertations
- Methodology must be locked before data collection begins
- Data collection window should have 30% buffer (things always take longer)
- Analysis phase needs dedicated time — not combined with writing
- First complete draft should be done 3-4 weeks before deadline
- Account for supervisor feedback turnaround (typically 2 weeks)

**Methodology-Specific Adjustments:**
- Quantitative: Longer data collection, shorter analysis write-up
- Qualitative: Interview scheduling buffer, longer analysis phase
- Literature-based: No data collection, longer critical analysis phase
- Mixed: Longest timeline, needs careful phase sequencing

### 4.2 Check-In Conversation

**Tone:** Supportive but direct. Like a slightly older friend who's done this before. Not corporate, not patronising. Uses "you" not "the student." Occasional humour. British English.

**Behaviour Rules:**
- If student is on track: Brief acknowledgment, highlight what's next, reinforce confidence
- If slightly behind (< 1 week): Acknowledge, don't catastrophise, suggest specific catch-up actions
- If significantly behind (> 2 weeks): Be honest about impact, present options (reduce scope, increase hours, extend if possible), ask what's realistic
- If consistently missing check-ins: Gentle re-engagement, acknowledge it's hard, lower the bar ("can you do just one thing this week?")
- If mood is consistently low: Express concern, suggest speaking to supervisor or university support services, provide relevant links

**Hard Boundaries (never cross):**
- Never write or suggest academic content of any kind
- Never recommend specific sources, references, or readings
- Never evaluate the quality of their academic work
- Never suggest shortcuts that compromise academic integrity
- If asked to do any of the above, redirect clearly: "That's one for your supervisor — my job is keeping you on schedule"

### 4.3 Plan Adjustment Logic

When a check-in reveals the plan needs changing:
1. Calculate actual progress vs planned progress
2. Identify which future milestones are affected
3. Generate adjusted timeline preserving:
   - Hard dependencies (can't skip phases)
   - Minimum quality time per phase
   - Submission deadline (fixed unless explicitly asked)
4. If the plan becomes unworkable (not enough time), be transparent:
   - "At your current pace, you'd need X hours/week to finish on time. That's up from Y."
   - "Options: reduce word count, narrow scope, or talk to your supervisor about an extension."

---

## 5. Monetisation

### 5.1 Free Tier
- One project
- Initial plan generation
- First 2 weekly check-ins
- Then prompts to upgrade

### 5.2 Pro Monthly — £4.99/mo
- Unlimited projects
- Unlimited check-ins
- Dynamic plan adjustment
- Progress dashboard
- Email nudges

### 5.3 Pro Annual — £29.99/year (best value)
- Everything in Monthly
- AI transparency log export (PDF)
- Supervisor-ready progress reports
- Methodology planning assistant
- Priority support

### 5.4 Revenue Projections (Conservative)

| Scenario | Users | Avg Revenue/User | Monthly Revenue |
|----------|-------|-------------------|-----------------|
| 3 months | 100 | £4.99 | £499 |
| 6 months | 500 | £4.50 (mix) | £2,250 |
| 12 months | 2,000 | £4.00 (mix) | £8,000 |

Key growth moments: September (new academic year), January (dissertation kickoff), March (panic season).

---

## 6. Go-To-Market Strategy

### 6.1 Week 1: Soft Launch
- Share with colleagues teaching dissertation modules
- Ask 5 academics to mention it to their cohorts
- Post in university-specific student forums/groups

### 6.2 Month 1: Community Seeding
- Reddit: r/UniUK, r/UKuniversities (genuinely helpful posts, not spam)
- TikTok: Short-form content about dissertation planning tips (link in bio)
- Student Facebook groups (every university has several)

### 6.3 Month 2-3: Organic Growth
- SEO: Target "dissertation planning," "dissertation timeline," "how to plan a dissertation UK"
- Referral programme: Give a friend 1 free month, get 1 free month
- Testimonials from early users

### 6.4 Seasonal Calendar
- **September:** "Starting your final year? Start here." Push annual plans.
- **January:** "Dissertation kickoff" — heaviest marketing period.
- **March-April:** "Behind already? We've got you." Recovery plan messaging.
- **May-June:** Wind down. Collect testimonials from graduating students.

---

## 7. Technical Notes

### 7.1 Performance Requirements
- Plan generation: < 10 seconds
- Page load: < 2 seconds
- Check-in response: < 5 seconds
- 99.5% uptime (students panic if it's down near deadlines)

### 7.2 Data & Privacy
- GDPR compliant (UK users)
- Minimal data collection
- Students can delete all data at any time
- No academic content is ever stored (because none is ever generated)
- AI interaction logs stored for transparency export, deletable by user

### 7.3 Future Considerations (NOT for MVP)
- Mobile app (PWA first, native later)
- University institutional licences
- Integration with university VLEs (Moodle, Canvas)
- Group project management mode
- Supervisor dashboard (students share read-only progress)
- WhatsApp check-in integration (where students actually live)
