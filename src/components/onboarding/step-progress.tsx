"use client";

import type { OnboardingData } from "@/app/onboarding/page";

const PROGRESS_OPTIONS = [
  {
    value: "not_started",
    label: "Haven't started",
    emoji: "😶",
    desc: "Starting from scratch",
  },
  {
    value: "chosen_topic",
    label: "Chosen my topic",
    emoji: "💡",
    desc: "I know what I'm doing, just haven't started yet",
  },
  {
    value: "started_reading",
    label: "Started reading",
    emoji: "📖",
    desc: "Got some sources, early literature review",
  },
  {
    value: "have_proposal",
    label: "Have a proposal",
    emoji: "📋",
    desc: "Supervisor has signed off on my plan",
  },
  {
    value: "collecting_data",
    label: "Already collecting data",
    emoji: "🔬",
    desc: "Research is underway",
  },
];

type Props = {
  data: OnboardingData;
  update: (fields: Partial<OnboardingData>) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function StepProgress({ data, update, onSubmit, onBack }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Where are you right now?</h2>
      <p className="text-gray-400 text-sm mb-6">
        No judgment — this tells us where your plan needs to start.
      </p>

      <div className="space-y-2 mb-8">
        {PROGRESS_OPTIONS.map((p) => (
          <button
            key={p.value}
            onClick={() => update({ currentProgress: p.value })}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
              data.currentProgress === p.value
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 hover:border-gray-500 bg-gray-800/50"
            }`}
          >
            <span className="text-2xl flex-shrink-0">{p.emoji}</span>
            <div>
              <div className="font-medium text-sm">{p.label}</div>
              <div className="text-gray-400 text-xs mt-0.5">{p.desc}</div>
            </div>
            {data.currentProgress === p.value && (
              <span className="ml-auto text-purple-400">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!data.currentProgress}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Build my plan ✨
        </button>
      </div>
    </div>
  );
}
