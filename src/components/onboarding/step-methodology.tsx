"use client";

import type { OnboardingData } from "@/app/onboarding/page";

const METHODS = [
  {
    value: "qualitative",
    label: "Qualitative",
    emoji: "🗣️",
    desc: "Interviews, focus groups, thematic analysis",
  },
  {
    value: "quantitative",
    label: "Quantitative",
    emoji: "📊",
    desc: "Surveys, experiments, statistical analysis",
  },
  {
    value: "mixed",
    label: "Mixed Methods",
    emoji: "🔀",
    desc: "Combination of qual and quant",
  },
  {
    value: "literature_based",
    label: "Literature-Based",
    emoji: "📖",
    desc: "Critical analysis of existing research",
  },
  {
    value: "not_sure",
    label: "Not Sure Yet",
    emoji: "🤔",
    desc: "We'll build in time to decide",
  },
];

type Props = {
  data: OnboardingData;
  update: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepMethodology({ data, update, onNext, onBack }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">What kind of research?</h2>
      <p className="text-gray-400 text-sm mb-6">
        This shapes the structure of your plan — especially the data collection phase.
      </p>

      <div className="space-y-2 mb-8">
        {METHODS.map((m) => (
          <button
            key={m.value}
            onClick={() => update({ methodology: m.value })}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
              data.methodology === m.value
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 hover:border-gray-500 bg-gray-800/50"
            }`}
          >
            <span className="text-2xl flex-shrink-0">{m.emoji}</span>
            <div>
              <div className="font-medium text-sm">{m.label}</div>
              <div className="text-gray-400 text-xs mt-0.5">{m.desc}</div>
            </div>
            {data.methodology === m.value && (
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
          onClick={onNext}
          disabled={!data.methodology}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
