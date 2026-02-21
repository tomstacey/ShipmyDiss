"use client";

import { useState } from "react";

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  targetDate: Date;
  completedDate: Date | null;
  status: string;
  estimatedHours: number | null;
  deliverable: string | null;
  order: number;
};

const PHASE_LABELS: Record<string, string> = {
  lit_review: "Literature Review",
  methodology: "Methodology",
  data_collection: "Data Collection",
  analysis: "Analysis",
  drafting: "Drafting",
  editing: "Editing",
  submission: "Submission",
};

const STATUS_CONFIG: Record<
  string,
  { dot: string; badge: string; label: string }
> = {
  completed: {
    dot: "bg-green-500",
    badge: "bg-green-500/10 text-green-400 border-green-500/20",
    label: "Done ✓",
  },
  in_progress: {
    dot: "bg-purple-500 animate-pulse",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    label: "In progress",
  },
  overdue: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "Overdue",
  },
  adjusted: {
    dot: "bg-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    label: "Adjusted",
  },
  upcoming: {
    dot: "bg-gray-600",
    badge: "bg-gray-800 text-gray-400 border-gray-700",
    label: "Upcoming",
  },
};

export function MilestoneTimeline({
  milestones,
  deadline,
}: {
  milestones: Milestone[];
  deadline: Date;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {milestones.map((m, idx) => {
        const isExpanded = expanded === m.id;
        const date = new Date(m.targetDate);
        const isOverdue =
          m.status !== "completed" && m.status !== "in_progress" && date < new Date();
        const effectiveStatus = isOverdue ? "overdue" : m.status;
        const statusConfig = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.upcoming;
        const isLast = idx === milestones.length - 1;

        return (
          <div key={m.id} className="relative flex gap-4">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full mt-5 flex-shrink-0 ring-2 ring-gray-950 ${statusConfig.dot}`}
              />
              {!isLast && (
                <div className="w-px flex-1 bg-gray-800 mt-1" />
              )}
            </div>

            {/* Card */}
            <div className="flex-1 pb-4">
              <button
                onClick={() => setExpanded(isExpanded ? null : m.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isExpanded
                    ? "border-gray-600 bg-gray-800/80"
                    : "border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-800/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {PHASE_LABELS[m.phase] ?? m.phase}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig.badge}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm leading-snug">{m.title}</h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {date.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {m.estimatedHours && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        ~{m.estimatedHours}h
                      </p>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    {m.description && (
                      <p className="text-sm text-gray-300">{m.description}</p>
                    )}
                    {m.deliverable && (
                      <div className="bg-gray-900 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Done when:</p>
                        <p className="text-sm text-gray-300">{m.deliverable}</p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>
        );
      })}

      {/* Deadline marker */}
      <div className="relative flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full mt-2 flex-shrink-0 ring-2 ring-gray-950 bg-pink-500" />
        </div>
        <div className="flex-1 pb-4">
          <div className="p-3 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-pink-400">
                🎓 Submission deadline
              </span>
              <span className="text-xs text-gray-400">
                {new Date(deadline).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
