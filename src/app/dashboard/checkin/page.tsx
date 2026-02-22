"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Project = {
  id: string;
  title: string;
  deadline: string;
  milestones: Array<{
    id: string;
    title: string;
    status: string;
    targetDate: string;
  }>;
  checkIns: Array<{ weekNumber: number; createdAt: string }>;
};

type CheckInResult = {
  weekNumber: number;
  aiResponse: string;
  suggestPlanAdjustment: boolean;
  adjustmentReason?: string;
};

const MOOD_OPTIONS = [
  { value: 1, label: "😰", desc: "Struggling" },
  { value: 2, label: "😟", desc: "Behind" },
  { value: 3, label: "😐", desc: "Okay" },
  { value: 4, label: "🙂", desc: "Good" },
  { value: 5, label: "🚀", desc: "Smashing it" },
];

function CheckInContent() {
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("projectId");

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [completedTasks, setCompletedTasks] = useState<string[]>([""]);
  const [blockers, setBlockers] = useState("");
  const [moodRating, setMoodRating] = useState<number | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Plan adjustment state
  const [adjusting, setAdjusting] = useState(false);
  const [adjustDone, setAdjustDone] = useState(false);
  const [adjustSummary, setAdjustSummary] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch("/api/project/current");
        if (!res.ok) throw new Error("Failed to load project");
        const data = await res.json();
        setProject(urlProjectId
          ? data.projects?.find((p: Project) => p.id === urlProjectId) ?? data.projects?.[0]
          : data.projects?.[0]);
      } catch {
        setError("Couldn't load your project. Try refreshing.");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [urlProjectId]);

  const addTask = () => setCompletedTasks((t) => [...t, ""]);
  const updateTask = (i: number, val: string) =>
    setCompletedTasks((t) => t.map((task, idx) => (idx === i ? val : task)));
  const removeTask = (i: number) =>
    setCompletedTasks((t) => t.filter((_, idx) => idx !== i));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project || moodRating === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          completedTasks: completedTasks.filter((t) => t.trim()),
          blockers: blockers.trim(),
          moodRating,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Check-in failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdjustPlan() {
    if (!project || !result) return;
    setAdjusting(true);
    try {
      const res = await fetch("/api/plan/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          reason: result.adjustmentReason,
        }),
      });
      if (!res.ok) throw new Error("Adjustment failed");
      const data = await res.json();
      setAdjustSummary(data.summary);
      setAdjustDone(true);
    } catch {
      setError("Couldn't adjust the plan. Try again from the Plan page.");
    } finally {
      setAdjusting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No project found. <a href="/onboarding" className="text-purple-400 underline">Create one first.</a></p>
      </div>
    );
  }

  const now = new Date();
  const deadline = new Date(project.deadline);
  const weeksRemaining = Math.max(
    0,
    Math.ceil((deadline.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );
  const weekNumber = (project.checkIns[0]?.weekNumber ?? 0) + 1;
  const currentMilestone = project.milestones.find(
    (m) => m.status === "in_progress" || m.status === "upcoming"
  );

  // — RESULT VIEW —
  if (result) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">✓</div>
          <div>
            <h1 className="text-xl font-bold">Week {result.weekNumber} check-in done</h1>
            <p className="text-gray-400 text-sm">{project.title}</p>
          </div>
        </div>

        {/* AI response */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-xs text-purple-400 font-medium mb-3 uppercase tracking-wide">Your AI project manager</p>
          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{result.aiResponse}</p>
        </div>

        {/* Plan adjustment prompt */}
        {result.suggestPlanAdjustment && !adjustDone && (
          <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-5 mb-6">
            <p className="text-amber-400 font-medium mb-1">⚠️ Plan adjustment suggested</p>
            {result.adjustmentReason && (
              <p className="text-gray-400 text-sm mb-4">{result.adjustmentReason}</p>
            )}
            <button
              onClick={handleAdjustPlan}
              disabled={adjusting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {adjusting ? "Adjusting plan…" : "Adjust my plan now"}
            </button>
          </div>
        )}

        {adjustDone && adjustSummary && (
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5 mb-6">
            <p className="text-green-400 font-medium mb-2">✓ Plan updated</p>
            <p className="text-gray-300 text-sm">{adjustSummary}</p>
          </div>
        )}

        <div className="flex gap-3">
          <a
            href="/dashboard"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Back to dashboard
          </a>
          <a
            href="/dashboard/plan"
            className="px-5 py-2.5 border border-gray-700 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors text-sm"
          >
            View plan
          </a>
        </div>
      </div>
    );
  }

  // — FORM VIEW —
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Week {weekNumber} check-in</h1>
        <p className="text-gray-400 text-sm mt-1">{project.title} · {weeksRemaining} weeks left</p>
      </div>

      {currentMilestone && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
          <p className="text-sm text-gray-300">
            Current milestone: <span className="text-white font-medium">{currentMilestone.title}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            How&apos;s it going this week?
          </label>
          <div className="flex gap-3">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMoodRating(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                  moodRating === opt.value
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
              >
                <span className="text-2xl">{opt.label}</span>
                <span className="text-xs text-gray-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Completed tasks */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            What did you get done this week?
            <span className="text-gray-500 font-normal ml-1">(leave blank if nothing)</span>
          </label>
          <div className="space-y-2">
            {completedTasks.map((task, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => updateTask(i, e.target.value)}
                  placeholder={i === 0 ? "e.g. Finished reading 3 papers on X" : "Another task…"}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {completedTasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(i)}
                    className="px-3 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTask}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors mt-1"
            >
              + Add another
            </button>
          </div>
        </div>

        {/* Blockers */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Any blockers or issues?
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            rows={3}
            placeholder="e.g. Waiting on ethics approval, struggling to find enough sources, life got in the way…"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || moodRating === null}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Getting your feedback…
            </span>
          ) : (
            "Submit check-in"
          )}
        </button>
      </form>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckInContent />
    </Suspense>
  );
}
