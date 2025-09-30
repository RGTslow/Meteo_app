import type { WeatherData } from "./types";

export async function getForecast(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&hourly=temperature_2m,relativehumidity_2m,weathercode` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
    `&forecast_days=3` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
