import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Weather App",
  description: "Next.js + TypeScript + Tailwind + Open-Meteo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900">
        {/* Global navigation */}
        <header className="border-b bg-gray-50">
          <nav className="mx-auto max-w-2xl flex gap-3 px-4 py-3 text-sm">
            <Link href="/" className="rounded-lg border px-3 py-1.5 hover:bg-gray-100">Home</Link>
            <Link href="/favorites" className="rounded-lg border px-3 py-1.5 hover:bg-gray-100">Favorites</Link>
            <Link href="/about" className="rounded-lg border px-3 py-1.5 hover:bg-gray-100">About</Link>
          </nav>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-2xl p-6">{children}</main>
      </body>
    </html>
  );
}
