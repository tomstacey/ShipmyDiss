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
