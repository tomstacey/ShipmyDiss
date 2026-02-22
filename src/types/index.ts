export type ProjectType = "dissertation" | "assignment" | "project" | "extended_essay";

export type Methodology =
  | "qualitative"
  | "quantitative"
  | "mixed"
  | "literature_based"
  | "not_sure";

export type Phase =
  | "lit_review"
  | "methodology"
  | "data_collection"
  | "analysis"
  | "drafting"
  | "editing"
  | "submission";

export type MilestoneStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "overdue"
  | "adjusted";

export type CheckInStatus = "pending" | "completed" | "skipped";

export type SubscriptionStatus = "free" | "active" | "cancelled" | "past_due";

export type CurrentProgress =
  | "not_started"
  | "chosen_topic"
  | "started_reading"
  | "have_proposal"
  | "collecting_data";

export type AIInteractionType = "plan_generation" | "checkin" | "plan_adjustment";

// ─── Document Analysis Types ───────────────────────────────────────

export type AssessmentCriterion = {
  name: string;
  description: string;
  weightPercent?: number;
};

export type MarkingWeight = {
  component: string;
  percent: number;
};

export type DocumentAnalysis = {
  /** Short summary of the uploaded document */
  rawSummary: string;
  /** Assessment criteria extracted from the brief / marking scheme */
  assessmentCriteria: AssessmentCriterion[];
  /** Marking weight breakdown if found */
  markingWeights: MarkingWeight[];
  /** Specific deliverables the student must produce */
  requiredDeliverables: string[];
  /** Methodology constraints (e.g. "secondary data only", "must use qualitative interviews") */
  methodologyConstraints: string[];
  /** Ethics / IRB requirements mentioned */
  ethicsRequirements: string[];
  /** Key requirements that don't fit other categories */
  keyRequirements: string[];
  /** Supervisor meeting expectations (e.g. "meet fortnightly") */
  supervisorMeetingExpectations?: string;
  /** Word count if found in the document (may differ from what student entered) */
  extractedWordCount?: number;
  /** Deadline if found in the document */
  extractedDeadline?: string;
};
