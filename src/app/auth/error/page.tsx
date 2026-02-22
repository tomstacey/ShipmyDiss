"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Verification: "The sign-in link has expired or already been used. Request a new one.",
  AccessDenied: "You don't have permission to sign in.",
  Default: "Something went wrong during sign-in. Please try again.",
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Sign-in failed</h1>
        <p className="text-gray-400 mb-6">{message}</p>
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
