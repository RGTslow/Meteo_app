"use client";

import type { City } from "@/lib/types";

type Props = {
  loading: boolean;
  error: string | null;
  query: string;
  items: City[];
  onPick: (c: City) => void;
};

export default function SuggestionsList({ loading, error, query, items, onPick }: Props) {
  const showNoResults = !loading && !error && query.trim().length > 0 && items.length === 0;

  return (
    <div className="space-y-2">
      {/* Status */}
      <div aria-live="polite" className="min-h-[1.5rem] text-sm">
        {loading && <span>Loading…</span>}
        {!loading && showNoResults && <span>No results</span>}
        {!loading && error && <span className="text-red-600">{error}</span>}
      </div>

      {/* List */}
      <ul className="divide-y rounded-lg border">
        {items.map((s, idx) => (
          <li key={`${s.latitude}-${s.longitude}-${idx}`}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring"
            >
              {s.name}, {s.country}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
