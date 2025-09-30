export default function AboutPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">About</h1>
      <p>
        Mini weather app built with Next.js (App Router), TypeScript, Tailwind, and the
        Open-Meteo API (no API key required).
      </p>
      <ul className="list-disc ml-6 space-y-1">
        <li>City search with debounce & suggestions</li>
        <li>Current weather + next 5 hours</li>
        <li>3-day forecast (min/max)</li>
        <li>Favorites saved in localStorage</li>
        <li>Routes: /, /favorites, /about</li>
      </ul>
    </main>
  );
}
