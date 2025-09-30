"use client";

import type { City } from "@/lib/types";

type Props = {
  city: City;
  isFavorite: boolean;
  onAdd: () => void;
  onRemove: () => void;
};

export default function SelectedCityPanel({ city, isFavorite, onAdd, onRemove }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-medium">Selected City</h2>
        <p>{city.name}, {city.country}</p>
        <p className="text-xs text-gray-500">lat: {city.latitude} · lon: {city.longitude}</p>
      </div>
      {isFavorite ? (
        <button onClick={onRemove} className="rounded-lg border px-3 py-2 hover:bg-gray-50">
          Remove from favorites
        </button>
      ) : (
        <button onClick={onAdd} className="rounded-lg border px-3 py-2 hover:bg-gray-50">
          Add to favorites
        </button>
      )}
    </div>
  );
}
