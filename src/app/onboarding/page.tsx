"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepProjectType } from "@/components/onboarding/step-project-type";
import { StepBasics } from "@/components/onboarding/step-basics";
import { StepTime } from "@/components/onboarding/step-time";
import { StepMethodology } from "@/components/onboarding/step-methodology";
import { StepProgress } from "@/components/onboarding/step-progress";
import { GeneratingPlan } from "@/components/onboarding/generating-plan";

export type OnboardingData = {
  // Step 1
  projectType: string;
  // Step 2
  title: string;
  wordCount: number;
  deadline: string;
  // Step 3
  weeklyHours: number;
  blockedWeeks: string[];
  otherDeadlines: { date: string; description: string }[];
  // Step 4
  methodology: string;
  // Step 5
  currentProgress: string;
};

const INITIAL_DATA: OnboardingData = {
  projectType: "",
  title: "",
  wordCount: 10000,
  deadline: "",
  weeklyHours: 10,
  blockedWeeks: [],
  otherDeadlines: [],
  methodology: "",
  currentProgress: "",
};

const STEPS = [
  "Project type",
  "The basics",
  "Your time",
  "Methodology",
  "Where you're at",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(fields: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  async function submit() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate plan");
      }
      const { projectId } = await res.json();
      router.push(`/dashboard?projectId=${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  if (generating) {
    return <GeneratingPlan />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm text-purple-400 font-medium mb-1">
            Step {step + 1} of {STEPS.length}
          </p>
          <div className="flex gap-1.5 justify-center mt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= step
                    ? "bg-purple-500 w-8"
                    : "bg-gray-700 w-4"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Steps */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {step === 0 && (
            <StepProjectType data={data} update={update} onNext={next} />
          )}
          {step === 1 && (
            <StepBasics data={data} update={update} onNext={next} onBack={back} />
          )}
          {step === 2 && (
            <StepTime data={data} update={update} onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <StepMethodology data={data} update={update} onNext={next} onBack={back} />
          )}
          {step === 4 && (
            <StepProgress data={data} update={update} onSubmit={submit} onBack={back} />
          )}
        </div>
      </div>
    </div>
  );
}
