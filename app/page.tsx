"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

//IMPORTS RELATIFS 
import SearchBox from "../components/SearchBox";
import SuggestionsList from "../components/SuggestionsList";
import SelectedCityPanel from "../components/SelectedCityPanel";
import WeatherSummary from "../components/WeatherSummary";
import type { City, WeatherData } from "../lib/types";
import { searchCities } from "../lib/geocoding";
import { getForecast } from "../lib/forecast";


const FAVORITES_KEY = "weather_favorites";

function loadFavorites(): City[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveFavorites(items: City[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}

export default function HomePage() {
  // Search
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection & weather
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<City[]>([]);
  const isFavorite = useMemo(
    () =>
      !!selectedCity &&
      favorites.some(
        (c) =>
          Math.abs(c.latitude - selectedCity.latitude) < 1e-9 &&
          Math.abs(c.longitude - selectedCity.longitude) < 1e-9
      ),
    [favorites, selectedCity]
  );

  const params = useSearchParams();

  // Init favorites
  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  // Arrive depuis /favorites (query params)
  useEffect(() => {
    const lat = params.get("lat");
    const lon = params.get("lon");
    const name = params.get("name");
    const country = params.get("country");
    if (lat && lon && name && country) {
      setSelectedCity({
        name,
        country,
        latitude: Number(lat),
        longitude: Number(lon),
      });
      setQuery(name);
    }
  }, [params]);

  // Geocoding (debounce léger)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setError(null);
      setLoading(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const cities = await searchCities(q);
        setSuggestions(cities);
      } catch {
        setError("Error loading data");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Forecast
  useEffect(() => {
    if (!selectedCity) return;
    (async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);
        const data = await getForecast(
          selectedCity.latitude,
          selectedCity.longitude
        );
        setWeather(data);
      } catch {
        setWeather(null);
        setWeatherError("Error loading weather");
      } finally {
        setWeatherLoading(false);
      }
    })();
  }, [selectedCity]);

  // Actions
  function onPick(city: City) {
    setSelectedCity(city);
    setSuggestions([]);
    setQuery(city.name);
  }

  function addFavorite() {
    if (!selectedCity || isFavorite) return;
    const next = [...favorites, selectedCity];
    setFavorites(next);
    saveFavorites(next);
  }

  function removeFavorite() {
    if (!selectedCity) return;
    const next = favorites.filter(
      (c) =>
        c.latitude !== selectedCity.latitude ||
        c.longitude !== selectedCity.longitude
    );
    setFavorites(next);
    saveFavorites(next);
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Weather App</h1>

      <SearchBox
        query={query}
        onChange={(v) => {
          setQuery(v);
          setSelectedCity(null);
          setWeather(null);
          setWeatherError(null);
        }}
      />

      <SuggestionsList
        loading={loading}
        error={error}
        query={query}
        items={suggestions}
        onPick={onPick}
      />

      {selectedCity && (
        <>
          <SelectedCityPanel
            city={selectedCity}
            isFavorite={isFavorite}
            onAdd={addFavorite}
            onRemove={removeFavorite}
          />
          <WeatherSummary
            city={selectedCity}
            data={weather}
            loading={weatherLoading}
            error={weatherError}
          />
        </>
      )}
    </main>
  );
}
