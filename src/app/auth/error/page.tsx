"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error");
  const fullUrl = typeof window !== "undefined" ? window.location.href : "";
  // The callback URL that was attempted (set by NextAuth before redirecting here)
  const callbackUrl = typeof document !== "undefined"
    ? document.referrer
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
        <p className="text-gray-400 mb-4">
          Something went wrong during sign-in.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-6 text-left">
          <p className="text-red-400 font-mono text-sm mb-2">Error: {error || "Unknown error"}</p>
          <p className="text-gray-500 font-mono text-xs break-all">URL: {fullUrl}</p>
          {callbackUrl && <p className="text-gray-600 font-mono text-xs break-all mt-1">Ref: {callbackUrl}</p>}
        </div>
        <a
          href="/auth/signin"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Try again
        </a>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <ErrorContent />
    </Suspense>
  );
}
