"use client";

type Props = {
  query: string;
  onChange: (v: string) => void;
};

export default function SearchBox({ query, onChange }: Props) {
  return (
    <div>
      <label htmlFor="city" className="block mb-1 text-sm font-medium">
        City
      </label>
      <input
        id="city"
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Paris, London, Bogotá…"
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
      />
    </div>
  );
}
