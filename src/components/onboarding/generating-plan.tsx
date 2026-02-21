"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Building your plan...",
  "Calculating your timeline...",
  "Applying PM methodology...",
  "Scheduling milestones...",
  "Adding buffer time...",
  "Almost there...",
];

export function GeneratingPlan() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="relative w-16 h-16 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
          <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2 transition-opacity">
          {MESSAGES[msgIndex]}
        </h2>
        <p className="text-gray-400 text-sm">
          This is the hardest part and you&apos;ve already done it.
        </p>
      </div>
    </div>
  );
}
