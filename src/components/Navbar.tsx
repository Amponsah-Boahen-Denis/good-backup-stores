"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavbarRoutes } from "@/routes/AppRoutes";

export default function Navbar() {
  const pathname = usePathname();
  const routes = getNavbarRoutes();

  return (
    <nav className="w-full border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-white/40 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          my-best
        </Link>
        <ul className="flex items-center gap-4 text-sm">
          {routes.map((route) => {
            const isActive = pathname === route.path;
            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={
                    "px-3 py-1.5 rounded-full transition-colors " +
                    (isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-black/10 dark:hover:bg-white/10")
                  }
                >
                  {route.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}


