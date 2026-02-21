"use client";

import type { OnboardingData } from "@/app/onboarding/page";

const TYPES = [
  {
    value: "dissertation",
    label: "Dissertation",
    emoji: "📚",
    desc: "Final-year research dissertation",
  },
  {
    value: "extended_essay",
    label: "Extended Essay",
    emoji: "✍️",
    desc: "Long-form academic essay",
  },
  {
    value: "assignment",
    label: "Major Assignment",
    emoji: "📝",
    desc: "Significant coursework piece",
  },
  {
    value: "project",
    label: "Project",
    emoji: "🔬",
    desc: "Research or practical project",
  },
];

type Props = {
  data: OnboardingData;
  update: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
};

export function StepProjectType({ data, update, onNext }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">What are you working on?</h2>
      <p className="text-gray-400 text-sm mb-6">
        This helps us set the right structure for your plan.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              update({ projectType: t.value });
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              data.projectType === t.value
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 hover:border-gray-500 bg-gray-800/50"
            }`}
          >
            <div className="text-2xl mb-2">{t.emoji}</div>
            <div className="font-medium text-sm">{t.label}</div>
            <div className="text-gray-400 text-xs mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!data.projectType}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}
