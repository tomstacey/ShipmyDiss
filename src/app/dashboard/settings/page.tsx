"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DocumentUploadCard } from "@/components/dashboard/document-upload-card";
import type { DocumentAnalysis } from "@/types";

type Project = {
  id: string;
  title: string;
  type: string;
  documentAnalysis: DocumentAnalysis | null;
  documentFileName: string | null;
};

export default function SettingsPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenAvailable, setRegenAvailable] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenMessage, setRegenMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/project/current");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProject(data.projects?.[0] ?? null);
      } catch {
        // silently fail — page will show "no project"
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRegenerate() {
    if (!project) return;
    setRegenerating(true);
    setRegenMessage(null);
    try {
      const res = await fetch("/api/plan/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          reason: "Document analysis updated — re-adjusting plan to align with brief requirements",
        }),
      });
      if (!res.ok) throw new Error("Failed to adjust plan");
      const data = await res.json();
      setRegenMessage(data.summary);
      setRegenAvailable(false);
    } catch {
      setRegenMessage("Couldn't adjust the plan. Try again later.");
    } finally {
      setRegenerating(false);
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
        <p className="text-gray-400">
          No project found.{" "}
          <a href="/onboarding" className="text-purple-400 underline">
            Create one first.
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-400 text-sm mb-8">{project.title}</p>

      {/* Document upload section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-1">Project brief / marking scheme</h2>
        <p className="text-gray-400 text-sm mb-4">
          Upload your project brief or marking scheme to improve your plan with
          tailored milestones.
        </p>

        <DocumentUploadCard
          projectId={project.id}
          projectType={project.type}
          title={project.title}
          existingAnalysis={project.documentAnalysis}
          existingFileName={project.documentFileName}
          onAnalysisComplete={() => {
            setRegenAvailable(true);
          }}
        />
      </section>

      {/* Re-generate plan button */}
      {regenAvailable && (
        <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-5 mb-6">
          <p className="text-purple-300 font-medium mb-1">
            Document analysed — want to update your plan?
          </p>
          <p className="text-gray-400 text-sm mb-4">
            We&apos;ll adjust your milestones to align with the requirements in
            your brief.
          </p>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {regenerating
              ? "Adjusting plan…"
              : "Adjust my plan with new insights"}
          </button>
        </div>
      )}

      {regenMessage && (
        <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5 mb-6">
          <p className="text-green-400 font-medium mb-2">Plan updated</p>
          <p className="text-gray-300 text-sm">{regenMessage}</p>
        </div>
      )}

      {/* AI transparency log */}
      <section className="mb-8 pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold mb-1">AI transparency log</h2>
        <p className="text-gray-400 text-sm mb-4">
          A full record of every AI interaction for this project. Export it to
          show your supervisor or university that AI was used for planning only —
          never for writing academic content.
        </p>
        <Link
          href="/dashboard/transparency"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
        >
          View &amp; export transparency log →
        </Link>
      </section>
    </div>
  );
}
