import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f3f2ef] via-[#e6ecf2] to-white text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <div className="rounded-2xl border border-[#dce6f3] bg-white shadow-[0_8px_30px_rgba(10,102,194,0.12)] p-8 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full bg-[#e8f3ff] px-4 py-1 text-sm font-semibold text-[#0a66c2]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0a66c2] mr-2" />
                Powered by OpenStreetMap + Smart Relevance
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-[#0a66c2] sm:text-5xl">
                Discover local stores, stock, and working hours instantly
              </h1>
              <p className="text-lg text-slate-700 max-w-xl">
                Your local search engine for product availability and shop details. Find verified stores, compare results, and keep your own places listed for everyone.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/Search"
                  className="rounded-full border-2 border-[#0a66c2] bg-white px-6 py-3 text-sm font-semibold text-[#0a66c2] shadow-sm hover:bg-[#e7f3ff] hover:text-[#004a86]"
                >
                  Start Searching
                </Link>
                <Link
                  href="/Profile"
                  className="rounded-full border-2 border-[#0a66c2] bg-white px-6 py-3 text-sm font-semibold text-[#0a66c2] shadow-sm hover:bg-[#e7f3ff] hover:text-[#004a86]"
                >
                  Add your store
                </Link>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-[#dce6f3] bg-[#f7fbff] p-6">
              <h3 className="text-xl font-semibold text-[#0a66c2]">Key features</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="rounded-lg bg-white p-3 shadow-sm">
                  <strong className="text-[#0a66c2]">Smart query interpretation:</strong> classifies store/product/location intent for faster results.
                </li>
                <li className="rounded-lg bg-white p-3 shadow-sm">
                  <strong className="text-[#0a66c2]">Fast relevance scoring:</strong> name/category/tag/distance combined for top matches.
                </li>
                <li className="rounded-lg bg-white p-3 shadow-sm">
                  <strong className="text-[#0a66c2]">Working hours support:</strong> show business hours to customers directly from your listing.
                </li>
                <li className="rounded-lg bg-white p-3 shadow-sm">
                  <strong className="text-[#0a66c2]">History & analytics:</strong> recent searches and key trends saved locally.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
