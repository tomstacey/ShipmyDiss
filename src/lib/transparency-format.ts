/**
 * Shared helpers for formatting AIInteractionLog records into human-readable
 * TransparencyInteraction objects. Used by both the API route and the server-
 * rendered transparency page.
 */

// ─── Human-readable label maps ────────────────────────────────────────────────

export const TYPE_LABELS: Record<string, string> = {
  plan_generation: "Plan Generation",
  checkin: "Weekly Check-In",
  plan_adjustment: "Plan Adjustment",
  document_analysis: "Document Analysis",
};

export const PROGRESS_LABELS: Record<string, string> = {
  not_started: "Not started yet",
  chosen_topic: "Topic chosen",
  started_reading: "Started reading / research",
  have_proposal: "Have a proposal",
  collecting_data: "Currently collecting data",
};

export const METHODOLOGY_LABELS: Record<string, string> = {
  qualitative: "Qualitative",
  quantitative: "Quantitative",
  mixed: "Mixed methods",
  literature_based: "Literature-based",
  not_sure: "Not sure yet",
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  dissertation: "Dissertation",
  assignment: "Assignment",
  project: "Project",
  extended_essay: "Extended Essay",
};

export const MOOD_LABELS: Record<number, string> = {
  1: "Struggling (1/5)",
  2: "Difficult (2/5)",
  3: "OK (3/5)",
  4: "Good (4/5)",
  5: "Great (5/5)",
};

export const PHASE_LABELS: Record<string, string> = {
  lit_review: "Literature Review",
  methodology: "Methodology",
  data_collection: "Data Collection",
  analysis: "Analysis",
  drafting: "Drafting",
  editing: "Editing",
  submission: "Submission",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransparencyProject = {
  title: string;
  type: string;
  wordCount: number;
  deadline: string;
  methodology: string | null;
  createdAt: string;
};

export type PlanGenerationInput = {
  kind: "plan_generation_input";
  projectType: string;
  title: string;
  wordCount: number;
  deadline: string;
  methodology: string;
  currentProgress: string;
  weeklyHours: number;
  blockedWeeks: string[];
  otherDeadlines: { date: string; description: string }[];
  documentUploaded: boolean;
};

export type PlanGenerationOutput = {
  kind: "plan_generation_output";
  summary: string;
  milestoneCount: number;
  weeksAvailable: number;
  totalEstimatedHours: number;
  bufferWeeks: number;
  milestones: { title: string; phase: string; targetDate: string; estimatedHours: number }[];
};

export type CheckinInput = {
  kind: "checkin_input";
  completedTasks: string[];
  blockers: string;
  moodRating: number;
  moodLabel: string;
};

export type CheckinOutput = {
  kind: "checkin_output";
  response: string;
};

export type PlanAdjustmentInput = {
  kind: "plan_adjustment_input";
  reason: string;
};

export type PlanAdjustmentOutput = {
  kind: "plan_adjustment_output";
  summary: string;
};

export type DocumentAnalysisInput = {
  kind: "document_analysis_input";
  fileName: string;
};

export type DocumentAnalysisOutput = {
  kind: "document_analysis_output";
  summary: string;
};

export type ParseErrorFallback = {
  kind: "parse_error";
  raw: string;
};

export type StudentProvided =
  | PlanGenerationInput
  | CheckinInput
  | PlanAdjustmentInput
  | DocumentAnalysisInput
  | ParseErrorFallback;

export type AIProvided =
  | PlanGenerationOutput
  | CheckinOutput
  | PlanAdjustmentOutput
  | DocumentAnalysisOutput
  | ParseErrorFallback;

export type TransparencyInteraction = {
  id: string;
  type: string;
  typeLabel: string;
  timestamp: string;      // "21 February 2026 at 14:32"
  isoTimestamp: string;
  studentProvided: StudentProvided;
  aiProvided: AIProvided;
};

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return (
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function safeParseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Per-type parsers ─────────────────────────────────────────────────────────

function parsePlanGenerationInput(raw: string | null): PlanGenerationInput | ParseErrorFallback {
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") {
    return { kind: "parse_error", raw: raw ?? "" };
  }
  const d = parsed as Record<string, unknown>;
  return {
    kind: "plan_generation_input",
    projectType: PROJECT_TYPE_LABELS[d.projectType as string] ?? (d.projectType as string) ?? "Unknown",
    title: (d.title as string) ?? "Untitled",
    wordCount: (d.wordCount as number) ?? 0,
    deadline: d.deadline ? formatDate(new Date(d.deadline as string)) : "Unknown",
    methodology: METHODOLOGY_LABELS[d.methodology as string] ?? (d.methodology as string) ?? "Unknown",
    currentProgress: PROGRESS_LABELS[d.currentProgress as string] ?? (d.currentProgress as string) ?? "Unknown",
    weeklyHours: (d.weeklyHours as number) ?? 0,
    blockedWeeks: Array.isArray(d.blockedWeeks) ? (d.blockedWeeks as string[]).filter(Boolean) : [],
    otherDeadlines: Array.isArray(d.otherDeadlines)
      ? (d.otherDeadlines as { date: string; description: string }[])
      : [],
    documentUploaded: !!(d.documentAnalysis),
  };
}

function parsePlanGenerationOutput(raw: string | null): PlanGenerationOutput | ParseErrorFallback {
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") {
    return { kind: "parse_error", raw: raw ?? "" };
  }
  const d = parsed as Record<string, unknown>;
  const milestones = Array.isArray(d.milestones)
    ? (d.milestones as Record<string, unknown>[]).map((m) => ({
        title: (m.title as string) ?? "",
        phase: PHASE_LABELS[m.phase as string] ?? (m.phase as string) ?? "",
        targetDate: m.targetDate ? formatDate(new Date(m.targetDate as string)) : "",
        estimatedHours: (m.estimatedHours as number) ?? 0,
      }))
    : [];
  return {
    kind: "plan_generation_output",
    summary: (d.summary as string) ?? "",
    milestoneCount: milestones.length,
    weeksAvailable: (d.weeksAvailable as number) ?? 0,
    totalEstimatedHours: (d.totalEstimatedHours as number) ?? 0,
    bufferWeeks: (d.bufferWeeks as number) ?? 0,
    milestones,
  };
}

function parseCheckinInput(raw: string | null): CheckinInput | ParseErrorFallback {
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") {
    return { kind: "parse_error", raw: raw ?? "" };
  }
  const d = parsed as Record<string, unknown>;
  const moodRating = (d.moodRating as number) ?? 3;
  return {
    kind: "checkin_input",
    completedTasks: Array.isArray(d.completedTasks)
      ? (d.completedTasks as string[]).filter(Boolean)
      : [],
    blockers: (d.blockers as string) ?? "",
    moodRating,
    moodLabel: MOOD_LABELS[moodRating] ?? `${moodRating}/5`,
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

type RawLog = {
  id: string;
  interactionType: string;
  userInput: string | null;
  aiOutput: string | null;
  createdAt: Date;
};

export function parseInteraction(log: RawLog): TransparencyInteraction {
  const base = {
    id: log.id,
    type: log.interactionType,
    typeLabel: TYPE_LABELS[log.interactionType] ?? log.interactionType,
    timestamp: formatDateTime(log.createdAt),
    isoTimestamp: log.createdAt.toISOString(),
  };

  switch (log.interactionType) {
    case "plan_generation":
      return {
        ...base,
        studentProvided: parsePlanGenerationInput(log.userInput),
        aiProvided: parsePlanGenerationOutput(log.aiOutput),
      };

    case "checkin":
      return {
        ...base,
        studentProvided: parseCheckinInput(log.userInput),
        aiProvided: { kind: "checkin_output", response: log.aiOutput ?? "" },
      };

    case "plan_adjustment":
      return {
        ...base,
        studentProvided: {
          kind: "plan_adjustment_input",
          reason: log.userInput ?? "Adjustment requested",
        },
        aiProvided: {
          kind: "plan_adjustment_output",
          summary: log.aiOutput ?? "",
        },
      };

    case "document_analysis":
      return {
        ...base,
        studentProvided: {
          kind: "document_analysis_input",
          fileName: log.userInput ?? "Unknown file",
        },
        aiProvided: {
          kind: "document_analysis_output",
          summary: log.aiOutput ?? "",
        },
      };

    default:
      return {
        ...base,
        studentProvided: { kind: "parse_error", raw: log.userInput ?? "" },
        aiProvided: { kind: "parse_error", raw: log.aiOutput ?? "" },
      };
  }
}

type RawProject = {
  title: string;
  type: string;
  wordCount: number;
  deadline: Date;
  methodology: string | null;
  createdAt: Date;
};

export function formatProjectForExport(project: RawProject): TransparencyProject {
  return {
    title: project.title,
    type: PROJECT_TYPE_LABELS[project.type] ?? project.type,
    wordCount: project.wordCount,
    deadline: formatDate(project.deadline),
    methodology: project.methodology
      ? (METHODOLOGY_LABELS[project.methodology] ?? project.methodology)
      : null,
    createdAt: formatDate(project.createdAt),
  };
}
