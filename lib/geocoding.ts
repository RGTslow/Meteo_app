import type { City } from "./types";

export async function searchCities(q: string): Promise<City[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=5&language=en`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  return Array.isArray(data?.results)
    ? data.results
        .slice(0, 5)
        .map((r: any) => ({
          name: r.name,
          country: r.country ?? "",
          latitude: r.latitude,
          longitude: r.longitude,
        }))
        .filter(
          (r: City) =>
            typeof r.name === "string" &&
            typeof r.country === "string" &&
            typeof r.latitude === "number" &&
            typeof r.longitude === "number"
        )
    : [];
}
