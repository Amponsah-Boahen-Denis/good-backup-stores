import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Find the best stores near you</h1>
        <p className="text-sm text-black/70 dark:text-white/70 max-w-prose">
          Search for products and discover nearby stores with address and contact details using
          OpenStreetMap. Choose a product, pick a country or type a city/address, and we’ll show
          relevant places sorted by how well they match your query.
        </p>
        <ul className="list-disc pl-5 text-sm text-black/70 dark:text-white/70 space-y-1">
          <li>Clean input and auto-detect product category for better results</li>
          <li>Geocoding + places from OpenStreetMap with smart relevance scoring</li>
          <li>View recent searches in History; manage your stores in Profile</li>
        </ul>
        <div>
          <Link
            href="/Search"
            className="inline-flex items-center gap-2 rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Start Searching
          </Link>
        </div>
      </section>
    </main>
  );
}
