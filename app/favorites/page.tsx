"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { City } from "@/lib/types";
import { weatherCodeToText } from "@/lib/weatherCodes";
import { loadFavorites, saveFavorites } from "@/lib/storage";

type Now = { temp: number | null; code: number | null };

export default function FavoritesPage() {
  const [items, setItems] = useState<City[]>([]);
  const [nowByKey, setNowByKey] = useState<Record<string, Now>>({});
  const [loadingNow, setLoadingNow] = useState(false);

  // Load favorites
  useEffect(() => {
    setItems(loadFavorites());
  }, []);

  // Fetch current weather badge for each favorite
  useEffect(() => {
    if (!items.length) { setNowByKey({}); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoadingNow(true);
        const entries = await Promise.all(
          items.map(async (c) => {
            const key = `${c.latitude},${c.longitude}`;
            try {
              const url =
                `https://api.open-meteo.com/v1/forecast` +
                `?latitude=${c.latitude}&longitude=${c.longitude}` +
                `&current_weather=true&timezone=auto`;
              const res = await fetch(url);
              if (!res.ok) throw new Error(String(res.status));
              const data = await res.json();
              const temp = data?.current_weather?.temperature ?? null;
              const code = data?.current_weather?.weathercode ?? null;
              return [key, { temp, code }] as const;
            } catch {
              return [key, { temp: null, code: null }] as const;
            }
          })
        );
        if (!cancelled) setNowByKey(Object.fromEntries(entries));
      } finally {
        if (!cancelled) setLoadingNow(false);
      }
    })();
    return () => { cancelled = true; };
  }, [items]);

  function removeFav(city: City) {
    const next = items.filter(
      (c) =>
        Math.abs(c.latitude - city.latitude) >= 1e-9 ||
        Math.abs(c.longitude - city.longitude) >= 1e-9
    );
    setItems(next);
    saveFavorites(next);
    const key = `${city.latitude},${city.longitude}`;
    setNowByKey((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Favorites</h1>

      {items.length === 0 ? (
        <p className="text-sm text-gray-600">No favorites yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((c, idx) => {
            const href =
              `/?name=${encodeURIComponent(c.name)}` +
              `&country=${encodeURIComponent(c.country)}` +
              `&lat=${c.latitude}&lon=${c.longitude}`;
            const key = `${c.latitude},${c.longitude}`;
            const now = nowByKey[key];

            return (
              <li key={`${c.latitude}-${c.longitude}-${idx}`} className="px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{c.name}, {c.country}</div>
                    <div className="text-xs text-gray-500">lat: {c.latitude} · lon: {c.longitude}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick weather badge */}
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {loadingNow && !now ? "Loading…" : (
                        <>
                          {now?.temp != null ? `${now.temp}°C` : "—"} ·{" "}
                          {now?.code != null ? weatherCodeToText(now.code) : "—"}
                        </>
                      )}
                    </span>

                    <Link href={href} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                      View on Home
                    </Link>
                    <button
                      onClick={() => removeFav(c)}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
