"use client";

import type { OnboardingData } from "@/app/onboarding/page";
import { DocumentUploadCard } from "@/components/dashboard/document-upload-card";
import type { DocumentAnalysis } from "@/types";

type Props = {
  data: OnboardingData;
  update: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepDocumentUpload({ data, update, onNext, onBack }: Props) {
  const handleAnalysisComplete = (analysis: DocumentAnalysis, fileName: string) => {
    update({ documentAnalysis: analysis, documentFileName: fileName });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Your brief</h2>
      <p className="text-gray-400 text-sm mb-6">
        Got a project brief, marking scheme, or module handbook? Upload it and
        we&apos;ll tailor your plan to match.
      </p>

      <div className="mb-8">
        <DocumentUploadCard
          projectType={data.projectType}
          title={data.title}
          existingAnalysis={data.documentAnalysis}
          existingFileName={data.documentFileName}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
        >
          &larr; Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          {data.documentAnalysis ? "Continue →" : "Skip for now →"}
        </button>
      </div>
    </div>
  );
}
