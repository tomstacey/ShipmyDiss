"use client";

import type { OnboardingData } from "@/app/onboarding/page";

type Props = {
  data: OnboardingData;
  update: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepTime({ data, update, onNext, onBack }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Your time</h2>
      <p className="text-gray-400 text-sm mb-6">
        Be honest — we&apos;ll build a realistic plan around your actual availability.
      </p>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Hours per week you can realistically dedicate
            <span className="ml-2 text-purple-400 font-bold">
              {data.weeklyHours} hrs
            </span>
          </label>
          <input
            type="range"
            min={2}
            max={30}
            step={1}
            value={data.weeklyHours}
            onChange={(e) => update({ weeklyHours: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2 hrs</span>
            <span>30 hrs</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {data.weeklyHours <= 5
              ? "That's tight — we'll plan carefully around it. 👍"
              : data.weeklyHours <= 15
              ? "Solid amount — we'll build a steady plan. 💪"
              : "Ambitious! We'll make sure you use that time well. 🚀"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Any weeks you definitely can&apos;t work?{" "}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Add holiday dates, placement weeks, exam blocks, etc.
          </p>
          <div className="space-y-2">
            {data.blockedWeeks.map((week, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="date"
                  value={week}
                  onChange={(e) => {
                    const updated = [...data.blockedWeeks];
                    updated[i] = e.target.value;
                    update({ blockedWeeks: updated });
                  }}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
                />
                <button
                  onClick={() => {
                    update({
                      blockedWeeks: data.blockedWeeks.filter((_, j) => j !== i),
                    });
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            {data.blockedWeeks.length < 6 && (
              <button
                onClick={() =>
                  update({ blockedWeeks: [...data.blockedWeeks, ""] })
                }
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                + Add a blocked week
              </button>
            )}
          </div>
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
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
