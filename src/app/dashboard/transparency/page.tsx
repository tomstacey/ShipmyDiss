import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/ui/print-button";
import {
  parseInteraction,
  formatProjectForExport,
  type TransparencyInteraction,
  type PlanGenerationInput,
  type PlanGenerationOutput,
  type CheckinInput,
} from "@/lib/transparency-format";

// ─── Card colour config ───────────────────────────────────────────────────────

const TYPE_STYLE: Record<string, { badge: string; border: string; label: string }> = {
  plan_generation: {
    badge: "bg-purple-500/10 text-purple-400 print:bg-transparent print:text-purple-700 print:border print:border-purple-300",
    border: "border-l-purple-500 print:border-l-purple-400",
    label: "Plan Generation",
  },
  checkin: {
    badge: "bg-blue-500/10 text-blue-400 print:bg-transparent print:text-blue-700 print:border print:border-blue-300",
    border: "border-l-blue-500 print:border-l-blue-400",
    label: "Weekly Check-In",
  },
  plan_adjustment: {
    badge: "bg-amber-500/10 text-amber-400 print:bg-transparent print:text-amber-700 print:border print:border-amber-300",
    border: "border-l-amber-500 print:border-l-amber-400",
    label: "Plan Adjustment",
  },
  document_analysis: {
    badge: "bg-green-500/10 text-green-400 print:bg-transparent print:text-green-700 print:border print:border-green-300",
    border: "border-l-green-500 print:border-l-green-400",
    label: "Document Analysis",
  },
};

const DEFAULT_STYLE = {
  badge: "bg-gray-700 text-gray-300 print:border print:border-gray-400 print:text-gray-700",
  border: "border-l-gray-500",
  label: "AI Interaction",
};

// ─── Interaction card components ──────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 print:text-gray-500 mb-2">
        {title}
      </p>
      <div className="text-sm text-gray-300 print:text-gray-900 space-y-1">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 print:text-gray-500 shrink-0 min-w-[160px]">{label}:</span>
      <span className="text-gray-300 print:text-gray-900">{value}</span>
    </div>
  );
}

function InteractionCard({ interaction }: { interaction: TransparencyInteraction }) {
  const style = TYPE_STYLE[interaction.type] ?? DEFAULT_STYLE;

  return (
    <div
      className={`bg-gray-900 border border-gray-800 border-l-4 ${style.border} rounded-xl p-6 print:bg-white print:border-gray-200 print:rounded-none print:border print:border-l-4 print:break-inside-avoid print:mb-4`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
          {style.label}
        </span>
        <time
          dateTime={interaction.isoTimestamp}
          className="text-xs text-gray-500 print:text-gray-500"
        >
          {interaction.timestamp}
        </time>
      </div>

      {/* What the student provided */}
      {interaction.studentProvided.kind === "plan_generation_input" && (
        <PlanGenerationStudentSection data={interaction.studentProvided} />
      )}
      {interaction.studentProvided.kind === "checkin_input" && (
        <CheckinStudentSection data={interaction.studentProvided} />
      )}
      {interaction.studentProvided.kind === "plan_adjustment_input" && (
        <Section title="What you provided">
          <Field label="Reason" value={interaction.studentProvided.reason} />
        </Section>
      )}
      {interaction.studentProvided.kind === "document_analysis_input" && (
        <Section title="What you provided">
          <Field label="Document uploaded" value={interaction.studentProvided.fileName} />
        </Section>
      )}
      {interaction.studentProvided.kind === "parse_error" && (
        <Section title="What you provided">
          <span className="text-gray-500 italic">Could not parse input data</span>
        </Section>
      )}

      {/* Divider */}
      <div className="my-4 border-t border-gray-800 print:border-gray-200" />

      {/* What AI returned */}
      {interaction.aiProvided.kind === "plan_generation_output" && (
        <PlanGenerationAISection data={interaction.aiProvided} />
      )}
      {interaction.aiProvided.kind === "checkin_output" && (
        <Section title="What AI returned">
          <blockquote className="bg-gray-800/50 print:bg-gray-50 print:border-l-4 print:border-gray-300 rounded-lg p-4 text-gray-300 print:text-gray-900 italic leading-relaxed whitespace-pre-wrap">
            {interaction.aiProvided.response}
          </blockquote>
        </Section>
      )}
      {interaction.aiProvided.kind === "plan_adjustment_output" && (
        <Section title="What AI returned">
          <p className="text-gray-300 print:text-gray-900 leading-relaxed">
            {interaction.aiProvided.summary}
          </p>
        </Section>
      )}
      {interaction.aiProvided.kind === "document_analysis_output" && (
        <Section title="What AI returned">
          <p className="text-gray-300 print:text-gray-900 leading-relaxed">
            {interaction.aiProvided.summary}
          </p>
        </Section>
      )}
      {interaction.aiProvided.kind === "parse_error" && (
        <Section title="What AI returned">
          <span className="text-gray-500 italic">Could not parse output data</span>
        </Section>
      )}
    </div>
  );
}

function PlanGenerationStudentSection({ data }: { data: PlanGenerationInput }) {
  return (
    <Section title="What you provided">
      <Field label="Project type" value={data.projectType} />
      <Field label="Title / topic" value={data.title} />
      <Field label="Word count" value={`${data.wordCount.toLocaleString()} words`} />
      <Field label="Submission deadline" value={data.deadline} />
      <Field label="Methodology" value={data.methodology} />
      <Field label="Starting point" value={data.currentProgress} />
      <Field label="Weekly hours available" value={`${data.weeklyHours} hrs/week`} />
      {data.blockedWeeks.length > 0 && (
        <Field label="Blocked periods" value={data.blockedWeeks.join(", ")} />
      )}
      {data.otherDeadlines.length > 0 && (
        <Field
          label="Other deadlines"
          value={data.otherDeadlines
            .map((d) => `${d.description} (${d.date})`)
            .join(", ")}
        />
      )}
      <Field
        label="Brief uploaded"
        value={data.documentUploaded ? "Yes — AI analysis used to tailor plan" : "No"}
      />
    </Section>
  );
}

function PlanGenerationAISection({ data }: { data: PlanGenerationOutput }) {
  return (
    <Section title="What AI returned">
      <p className="text-gray-300 print:text-gray-900 leading-relaxed mb-3">
        {data.summary}
      </p>
      <div className="text-xs text-gray-500 print:text-gray-500 mb-3 flex gap-4 flex-wrap">
        <span>{data.milestoneCount} milestones generated</span>
        <span>{data.weeksAvailable} weeks available</span>
        <span>~{data.totalEstimatedHours} hours estimated</span>
        <span>{data.bufferWeeks} buffer weeks</span>
      </div>
      {data.milestones.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {data.milestones.map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-xs"
            >
              <span className="text-gray-600 print:text-gray-500 tabular-nums shrink-0 w-5 text-right">
                {i + 1}.
              </span>
              <span className="text-gray-300 print:text-gray-900 flex-1">{m.title}</span>
              <span className="text-gray-500 print:text-gray-500 shrink-0">{m.phase}</span>
              <span className="text-gray-500 print:text-gray-500 shrink-0 w-24 text-right">{m.targetDate}</span>
              <span className="text-gray-600 print:text-gray-500 shrink-0 w-12 text-right">{m.estimatedHours}h</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function CheckinStudentSection({ data }: { data: CheckinInput }) {
  return (
    <Section title="What you provided">
      <Field label="Mood" value={data.moodLabel} />
      {data.completedTasks.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-500 print:text-gray-500 shrink-0 min-w-[160px]">
            Tasks completed:
          </span>
          <ul className="list-disc list-inside space-y-0.5">
            {data.completedTasks.map((t, i) => (
              <li key={i} className="text-gray-300 print:text-gray-900">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.blockers && <Field label="Blockers / issues" value={data.blockers} />}
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TransparencyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const project = await prisma.project.findFirst({
    where: { userId: session.user.id },
    include: {
      aiInteractionLogs: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const exportedAt = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">No project found.</p>
        <Link href="/onboarding" className="text-purple-400 hover:text-purple-300">
          Create your first project →
        </Link>
      </div>
    );
  }

  const formattedProject = formatProjectForExport(project);
  const interactions = project.aiInteractionLogs.map(parseInteraction);

  const byType = {
    plan_generation: interactions.filter((i) => i.type === "plan_generation").length,
    checkin: interactions.filter((i) => i.type === "checkin").length,
    plan_adjustment: interactions.filter((i) => i.type === "plan_adjustment").length,
    document_analysis: interactions.filter((i) => i.type === "document_analysis").length,
  };

  const summaryParts = [
    byType.plan_generation > 0 && `${byType.plan_generation} plan generation`,
    byType.document_analysis > 0 && `${byType.document_analysis} document analysis`,
    byType.checkin > 0 && `${byType.checkin} check-in${byType.checkin !== 1 ? "s" : ""}`,
    byType.plan_adjustment > 0 && `${byType.plan_adjustment} plan adjustment${byType.plan_adjustment !== 1 ? "s" : ""}`,
  ].filter(Boolean).join(" · ");

  return (
    <>
      {/* Print-optimised global reset */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: white !important; color: black !important; }
          nav { display: none !important; }
        }
      `}</style>

      {/* Screen-only top bar */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link
          href="/dashboard/settings"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to settings
        </Link>
        <PrintButton />
      </div>

      {/* ── Printable document ── */}
      <div className="max-w-3xl mx-auto print:max-w-none">

        {/* Document header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6 print:bg-white print:border-gray-200 print:rounded-none print:mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-lg font-bold text-white print:text-black">
                shipmydiss 🚀
              </p>
              <h1 className="text-2xl font-bold text-white print:text-black mt-1">
                AI Transparency Log
              </h1>
            </div>
            <p className="text-sm text-gray-500 print:text-gray-500 text-right shrink-0">
              Exported {exportedAt}
            </p>
          </div>
          <div className="bg-gray-800/50 print:bg-gray-50 print:border print:border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-300 print:text-gray-700 leading-relaxed">
              This document is a complete record of every interaction between this student
              and AI systems through the ShipmyDiss platform. It confirms that AI was used
              exclusively for <strong className="text-white print:text-black">project planning and time management</strong> —
              not for generating, drafting, paraphrasing, or improving any academic content.
              No research, arguments, or written work were produced by AI.
            </p>
          </div>
        </div>

        {/* Project summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 print:bg-white print:border-gray-200 print:rounded-none print:mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 print:text-gray-500 mb-4">
            Project
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {(
              [
                ["Title", formattedProject.title],
                ["Type", formattedProject.type],
                ["Word count", `${formattedProject.wordCount.toLocaleString()} words`],
                ["Submission deadline", formattedProject.deadline],
                formattedProject.methodology
                  ? ["Methodology", formattedProject.methodology]
                  : null,
                ["Plan created", formattedProject.createdAt],
              ] as (string[] | null)[]
            )
              .filter((item): item is string[] => item !== null)
              .map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-gray-500 print:text-gray-500 shrink-0 min-w-[130px]">
                    {label}
                  </span>
                  <span className="text-gray-200 print:text-gray-900 font-medium">
                    {value}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Interaction summary */}
        {interactions.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 print:bg-white print:border-gray-200 print:rounded-none print:mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 print:text-gray-500 mb-3">
              Summary
            </h2>
            <p className="text-sm text-gray-300 print:text-gray-900">
              <span className="font-semibold text-white print:text-black">
                {interactions.length} total AI interaction{interactions.length !== 1 ? "s" : ""}
              </span>
              {summaryParts && (
                <span className="text-gray-400 print:text-gray-600"> · {summaryParts}</span>
              )}
            </p>
          </div>
        )}

        {/* Interaction log */}
        {interactions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No AI interactions logged yet.</p>
            <p className="text-sm mt-1">
              Your transparency log will appear here as you use the app.
            </p>
          </div>
        ) : (
          <div className="space-y-4 print:space-y-0">
            {interactions.map((interaction) => (
              <InteractionCard key={interaction.id} interaction={interaction} />
            ))}
          </div>
        )}

        {/* Document footer */}
        <div className="mt-10 pt-6 border-t border-gray-800 print:border-gray-300 text-center">
          <p className="text-xs text-gray-500 print:text-gray-500">
            Generated by ShipmyDiss · {exportedAt} · app.shipmydiss.com
          </p>
          <p className="text-xs text-gray-600 print:text-gray-400 mt-1">
            This log is generated directly from interaction records stored in the ShipmyDiss
            database and has not been manually edited.
          </p>
        </div>
      </div>
    </>
  );
}
