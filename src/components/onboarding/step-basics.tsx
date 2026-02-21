"use client";

import type { OnboardingData } from "@/app/onboarding/page";

const WORD_COUNTS = [
  { value: 3000, label: "3,000 words" },
  { value: 5000, label: "5,000 words" },
  { value: 8000, label: "8,000 words" },
  { value: 10000, label: "10,000 words" },
  { value: 12000, label: "12,000 words" },
  { value: 15000, label: "15,000 words" },
];

type Props = {
  data: OnboardingData;
  update: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepBasics({ data, update, onNext, onBack }: Props) {
  const isValid = data.title.trim() && data.deadline;

  // Get min date (today + 4 weeks)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 28);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">The basics</h2>
      <p className="text-gray-400 text-sm mb-6">
        Tell us about your project.
      </p>

      <div className="space-y-5 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Project title or topic
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. The impact of social media on political polarisation"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Target word count
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WORD_COUNTS.map((wc) => (
              <button
                key={wc.value}
                onClick={() => update({ wordCount: wc.value })}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  data.wordCount === wc.value
                    ? "border-purple-500 bg-purple-500/10 text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {wc.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Submission deadline
          </label>
          <input
            type="date"
            value={data.deadline}
            min={minDateStr}
            onChange={(e) => update({ deadline: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm [color-scheme:dark]"
          />
        </div>
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
          disabled={!isValid}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
