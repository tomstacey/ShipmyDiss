"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "free", label: "Free" },
  { value: "active", label: "Active (paid / beta)" },
  { value: "cancelled", label: "Cancelled" },
  { value: "past_due", label: "Past due" },
];

export function SubscriptionEditor({
  userId,
  current,
}: {
  userId: string;
  current: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: value }),
      });

      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={loading || value === current}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? "Saving…" : "Save"}
      </button>
      {saved && <span className="text-xs text-green-400">Saved ✓</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
