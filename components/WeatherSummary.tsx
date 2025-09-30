"use client";

import type { City, WeatherData } from "../lib/types";
import { weatherCodeToText } from "../lib/weatherCodes";

type Props = {
  city: City;
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
};

function findNearestHourIndex(hourlyTimes: string[], currentISO: string): number {
  if (!hourlyTimes?.length) return 0;

  const current = Date.parse(currentISO);
  if (Number.isNaN(current)) return 0;

  // 1) Premier index avec time >= current
  const firstFuture = hourlyTimes.findIndex((t) => Date.parse(t) >= current);
  if (firstFuture >= 0) return firstFuture;

  // 2) Sinon, on prend l’index du timestamp le plus proche (fin de tableau)
  return hourlyTimes.length - 1;
}

export default function WeatherSummary({ city, data, loading, error }: Props) {
  if (loading) return <p>Loading weather…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return null;

  const hourlyTimes = data.hourly?.time ?? [];
  const hourlyTemps = data.hourly?.temperature_2m ?? [];
  const hourlyCodes = data.hourly?.weathercode ?? [];
  const hourlyHumidity = data.hourly?.relativehumidity_2m ?? [];

  // Trouver un index "proche" de l'heure actuelle
  const startIdx = findNearestHourIndex(hourlyTimes, data.current_weather.time);

  // Humidité actuelle (si dispo au même index, sinon fallback)
  let currentHumidity: number | null = null;
  if (hourlyHumidity.length) {
    currentHumidity =
      hourlyHumidity[startIdx] ??
      hourlyHumidity[Math.min(startIdx, hourlyHumidity.length - 1)] ??
      hourlyHumidity[0] ??
      null;
  }

  // Prochaines 5 heures (borne max sécurisée)
  const endIdx = Math.min(startIdx + 5, hourlyTimes.length);
  const next5Hours = [];
  for (let i = startIdx; i < endIdx; i++) {
    next5Hours.push({
      time: hourlyTimes[i],
      temp: hourlyTemps[i],
      code: hourlyCodes[i],
    });
  }

  // 3 prochains jours
  const next3Days = (data.daily?.time ?? []).slice(0, 3).map((d, i) => ({
    date: d,
    tmin: data.daily!.temperature_2m_min[i],
    tmax: data.daily!.temperature_2m_max[i],
    code: data.daily!.weathercode[i],
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">City</div>
          <div className="text-lg font-medium">{city.name}, {city.country}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">Temperature</div>
          <div className="text-lg font-medium">{data.current_weather.temperature}°C</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">Humidity</div>
          <div className="text-lg font-medium">
            {currentHumidity ?? "—"}{currentHumidity != null ? "%" : ""}
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">Conditions</div>
          <div className="text-lg font-medium">
            {weatherCodeToText(data.current_weather.weathercode)}
          </div>
        </div>
      </div>

      {/* Next 5 hours */}
      <div>
        <h4 className="font-medium mb-2">Next 5 Hours</h4>
        {next5Hours.length === 0 ? (
          <p className="text-sm text-gray-600">No hourly data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[500px] w-full border rounded-lg text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left border">Time</th>
                  <th className="px-3 py-2 text-left border">Temp (°C)</th>
                  <th className="px-3 py-2 text-left border">Conditions</th>
                </tr>
              </thead>
              <tbody>
                {next5Hours.map((h, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 border">
                      {h?.time ? new Date(h.time).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2 border">
                      {typeof h?.temp === "number" ? h.temp : "—"}
                    </td>
                    <td className="px-3 py-2 border">
                      {typeof h?.code === "number" ? weatherCodeToText(h.code) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Next 3 days */}
      <div>
        <h4 className="font-medium mb-2">3-Day Forecast</h4>
        <div className="grid sm:grid-cols-3 gap-3">
          {next3Days.map((d, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(d.date).toLocaleDateString()}
              </div>
              <div className="text-sm">{weatherCodeToText(d.code)}</div>
              <div className="text-sm">Min: {d.tmin}°C</div>
              <div className="text-sm">Max: {d.tmax}°C</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
