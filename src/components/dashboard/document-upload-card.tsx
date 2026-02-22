"use client";

import { useCallback, useState, useRef } from "react";
import type { DocumentAnalysis } from "@/types";

type Props = {
  projectId?: string;
  projectType?: string;
  title?: string;
  existingAnalysis?: DocumentAnalysis | null;
  existingFileName?: string | null;
  onAnalysisComplete: (analysis: DocumentAnalysis, fileName: string) => void;
};

type UploadState = "idle" | "uploading" | "analysing" | "complete" | "error";

export function DocumentUploadCard({
  projectId,
  projectType,
  title,
  existingAnalysis,
  existingFileName,
  onAnalysisComplete,
}: Props) {
  const [state, setState] = useState<UploadState>(
    existingAnalysis ? "complete" : "idle"
  );
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(
    existingAnalysis ?? null
  );
  const [fileName, setFileName] = useState<string | null>(
    existingFileName ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setState("uploading");
      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", projectId);
      if (projectType) formData.append("projectType", projectType);
      if (title) formData.append("title", title);

      try {
        setState("analysing");
        const res = await fetch("/api/document/analyse", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        setAnalysis(data.analysis);
        setState("complete");
        onAnalysisComplete(data.analysis, data.fileName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setState("error");
      }
    },
    [projectId, projectType, title, onAnalysisComplete]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setState("idle");
    setAnalysis(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ─── Analysing / Uploading state ───
  if (state === "uploading" || state === "analysing") {
    return (
      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <div>
            <p className="text-white font-medium">
              {state === "uploading" ? "Uploading…" : "Analysing your document…"}
            </p>
            <p className="text-gray-400 text-sm mt-0.5">
              {fileName}
              {state === "analysing" && " — this usually takes 10-15 seconds"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Complete state ───
  if (state === "complete" && analysis) {
    const criteriaCount = analysis.assessmentCriteria.length;
    const deliverableCount = analysis.requiredDeliverables.length;
    const hasWeights = analysis.markingWeights.length > 0;
    const hasMethodology = analysis.methodologyConstraints.length > 0;

    return (
      <div className="border border-green-800/50 rounded-xl p-6 bg-gray-900">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm">
              ✓
            </div>
            <div>
              <p className="text-white font-medium">Document analysed</p>
              <p className="text-gray-400 text-sm">{fileName}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Re-upload
          </button>
        </div>

        <p className="text-gray-300 text-sm mb-4">{analysis.rawSummary}</p>

        <div className="grid grid-cols-2 gap-3">
          {criteriaCount > 0 && (
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">Assessment criteria</p>
              <p className="text-white font-medium">{criteriaCount} found</p>
            </div>
          )}
          {deliverableCount > 0 && (
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">Deliverables</p>
              <p className="text-white font-medium">{deliverableCount} found</p>
            </div>
          )}
          {hasWeights && (
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">Marking weights</p>
              <p className="text-white font-medium">
                {analysis.markingWeights.map((w) => `${w.component} ${w.percent}%`).join(", ")}
              </p>
            </div>
          )}
          {hasMethodology && (
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">Methodology</p>
              <p className="text-white font-medium">
                {analysis.methodologyConstraints.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Error state ───
  if (state === "error") {
    return (
      <div className="border border-red-800/50 rounded-xl p-6 bg-gray-900">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-sm shrink-0">
            ✕
          </div>
          <div>
            <p className="text-white font-medium">Upload failed</p>
            <p className="text-red-400 text-sm mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // ─── Idle state (drop zone) ───
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        dragActive
          ? "border-purple-500 bg-purple-500/5"
          : "border-gray-700 hover:border-gray-500 bg-gray-900/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onFileSelect}
        className="hidden"
      />
      <div className="text-3xl mb-3">📄</div>
      <p className="text-white font-medium mb-1">
        Drop your document here or click to upload
      </p>
      <p className="text-gray-400 text-sm">
        PDF or DOCX, max 4 MB
      </p>
      <p className="text-gray-500 text-xs mt-3">
        Project briefs, marking schemes, module handbooks — anything that describes your assessment
      </p>
    </div>
  );
}
