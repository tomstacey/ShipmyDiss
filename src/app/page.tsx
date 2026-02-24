import Link from "next/link";
import { BETA_MODE } from "@/lib/site-config";

// ─── Reusable primitives ─────────────────────────────────────────────────────

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-gray-300 text-sm">
      <span className="text-purple-400 mt-0.5 shrink-0">✓</span>
      {children}
    </li>
  );
}

// ─── Pricing section ─────────────────────────────────────────────────────────

function PricingBeta() {
  return (
    <div className="flex justify-center">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-8 max-w-sm w-full">
        <div className="inline-block bg-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Beta access
        </div>
        <div className="mb-1">
          <span className="text-4xl font-bold text-white">£0</span>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Free while we&apos;re in beta · No card required
        </p>
        <ul className="space-y-3 mb-8">
          <CheckItem>Full personalised dissertation plan</CheckItem>
          <CheckItem>Weekly check-ins &amp; nudges</CheckItem>
          <CheckItem>Dynamic schedule adjustment</CheckItem>
          <CheckItem>Progress dashboard</CheckItem>
          <CheckItem>Project brief AI analysis</CheckItem>
          <CheckItem>AI transparency log</CheckItem>
        </ul>
        <Link
          href="/auth/signin"
          className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-center transition-colors"
        >
          Join the beta →
        </Link>
        <p className="text-gray-500 text-xs text-center mt-4">
          For UK university students · Paid plans launch after beta
        </p>
      </div>
    </div>
  );
}

function PricingPaid() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {/* Monthly */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <p className="text-gray-400 text-sm font-medium mb-2">Monthly</p>
        <div className="mb-1">
          <span className="text-4xl font-bold text-white">£4.99</span>
          <span className="text-gray-400 text-sm"> / month</span>
        </div>
        <p className="text-gray-500 text-sm mb-6">Cancel anytime</p>
        <ul className="space-y-3 mb-8">
          <CheckItem>Personalised dissertation plan</CheckItem>
          <CheckItem>Weekly check-ins &amp; nudges</CheckItem>
          <CheckItem>Dynamic schedule adjustment</CheckItem>
          <CheckItem>Progress dashboard</CheckItem>
        </ul>
        <Link
          href="/auth/signin"
          className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg text-center transition-colors border border-gray-700"
        >
          Start free trial
        </Link>
      </div>

      {/* Annual */}
      <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-8 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Save 50%
        </div>
        <p className="text-gray-400 text-sm font-medium mb-2">Full year</p>
        <div className="mb-1">
          <span className="text-4xl font-bold text-white">£29.99</span>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          One payment · covers your whole dissertation
        </p>
        <ul className="space-y-3 mb-8">
          <CheckItem>Everything in Monthly</CheckItem>
          <CheckItem>AI transparency log export</CheckItem>
          <CheckItem>Supervisor-ready progress reports</CheckItem>
          <CheckItem>Priority support</CheckItem>
          <CheckItem>Methodology planning assistant</CheckItem>
        </ul>
        <Link
          href="/auth/signin"
          className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-center transition-colors"
        >
          Get the full year →
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const ctaPrimary = BETA_MODE ? "Join the beta →" : "Start planning for free →";
  const heroTagline = BETA_MODE
    ? "Free during beta · No card required · UK universities only"
    : "Free to start · Pro from £4.99/mo · Cancel anytime";
  const heroBadge = BETA_MODE
    ? "🎉 Now free during beta"
    : "Dissertation deadline approaching";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ── */}
      <nav className="border-b border-gray-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-white">shipmydiss 🚀</span>
          <Link
            href="/auth/signin"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm px-4 py-1.5 rounded-full mb-6">
          {heroBadge}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Ship your dissertation.
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
          Your supervisor tells you what to write. Nobody tells you how to
          actually get it done.{" "}
          <span className="text-white">This does.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/auth/signin"
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            {ctaPrimary}
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold rounded-lg transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="text-gray-500 text-sm">{heroTagline}</p>
        <p className="text-gray-600 text-sm mt-2">
          2,400+ students shipping their dissertations
        </p>
      </section>

      {/* ── Problem ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">The real problem</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Your dissertation isn&apos;t hard because you&apos;re stupid. It&apos;s
            hard because nobody taught you to manage it.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "😵‍💫",
              title: "I don't know where to start",
              body: 'You\'ve got a 10,000-word mountain and a blank Google Doc. Your supervisor said "just get started."',
            },
            {
              icon: "📅",
              title: "I've got ages yet",
              body: "The deadline is months away so you keep pushing it. Then suddenly it's 3 weeks out and you haven't finished your lit review.",
            },
            {
              icon: "🔥",
              title: "I'll just cram it",
              body: "This isn't a 2,000-word essay. You cannot Red Bull your way through a dissertation in a week.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-gray-400">
              4 minutes to set up. Months of panic avoided.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              It&apos;s basically a project manager that doesn&apos;t judge you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                step: "01",
                title: "Tell us about your dissertation",
                body: "Topic, word count, deadline, weekly availability. Upload your brief or marking scheme for a fully tailored plan.",
              },
              {
                step: "02",
                title: "Get a proper plan, not a vague timeline",
                body: "A week-by-week schedule with real milestones: lit review done by X, methodology locked by Y, first draft by Z.",
              },
              {
                step: "03",
                title: "Weekly check-ins that keep you honest",
                body: "Quick nudges that ask what you've done, flag when you're slipping, and adjust your plan dynamically.",
              },
              {
                step: "04",
                title: "Ship it. Graduate. Move on.",
                body: "Submit on time, with zero all-nighters and an AI transparency log your uni can actually verify.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex gap-4"
              >
                <span className="text-purple-500 font-mono font-bold text-lg shrink-0">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrity ── */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3">
          Before you ask — this is definitely not cheating.
        </h2>
        <p className="text-gray-400 mb-8">
          We don&apos;t write a single word of your dissertation. We don&apos;t
          generate content. We don&apos;t touch your research.{" "}
          <span className="text-white">
            We teach you to manage the project.
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {[
            { icon: "✍️", label: "Zero content generation" },
            { icon: "📋", label: "AI transparency log included" },
            { icon: "🎓", label: "Supervisor-approved methodology" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300"
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Pricing</h2>
            {BETA_MODE ? (
              <p className="text-gray-400">
                We&apos;re in beta — which means you get everything free while
                we build it out.
              </p>
            ) : (
              <p className="text-gray-400">
                Less than your weekly Greggs. Seriously. That&apos;s the
                trade-off.
              </p>
            )}
          </div>
          {BETA_MODE ? <PricingBeta /> : <PricingPaid />}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">FAQ</h2>
        <div className="space-y-6">
          {[
            {
              q: "Will my university have a problem with this?",
              a: "No. We don't generate academic content — we help you plan and manage your time. It's the same thing a good supervisor or study skills workshop would do.",
            },
            {
              q: "I'm already behind. Is it too late?",
              a: "Nope. Tell us where you're at and how long you've got. We'll build a recovery plan that's actually realistic.",
            },
            {
              q: "What if I ignore the check-ins?",
              a: "We'll notice. And we'll adjust your plan accordingly. We're not your mum — but we will show you exactly what ignoring this week means for your deadline.",
            },
            {
              q: "Does it work for taught modules too, not just dissertations?",
              a: "Yes. Any major assignment or project over 3,000 words works. Dissertations are just where the pain is worst.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="border-b border-gray-800 pb-6 last:border-0"
            >
              <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-20 text-center bg-gray-900/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Your dissertation isn&apos;t going to plan itself.
            <br />
            <span className="text-purple-400">
              Well, actually — now it can.
            </span>
          </h2>
          <p className="text-gray-400 mb-8">
            {BETA_MODE
              ? "Free during beta. No card. Just a better plan."
              : "Start free. Cancel anytime. No excuses."}
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            {ctaPrimary}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-900 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>
            © 2025 shipmydiss · Built by academics who&apos;ve seen too many
            students panic
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
