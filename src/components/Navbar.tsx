"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavbarRoutes } from "@/routes/AppRoutes";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const routes = getNavbarRoutes();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="w-full border-b border-[#d4e5f6] bg-white/95 backdrop-blur sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0a66c2]">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0a66c2] text-sm font-semibold text-white">
            MB
          </span>
          my-best
        </Link>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#0a66c2] text-[#0a66c2] md:hidden"
          aria-label="Toggle menu"
        >
          <span className="text-xl">☰</span>
        </button>

        <ul className="hidden items-center gap-2 text-sm font-medium md:flex">
          {routes.map((route) => {
            const isActive = pathname === route.path;
            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={`rounded-full px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-[#0a66c2]/40 ${
                    isActive
                      ? "border border-[#0a66c2] bg-white text-[#0a66c2] shadow-sm"
                      : "text-[#0a66c2] hover:bg-[#e7f3ff] hover:text-[#003c7b]"
                  }`}
                >
                  {route.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/Auth/Login"
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              pathname === "/Auth/Login"
                ? "border border-[#0a66c2] bg-white text-[#0a66c2]"
                : "border border-[#0a66c2] text-[#0a66c2] hover:bg-[#e7f3ff]"
            }`}
          >
            Login
          </Link>
          <Link
            href="/Auth/Signup"
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              pathname === "/Auth/Signup"
                ? "border border-[#0a66c2] bg-white text-[#0a66c2]"
                : "bg-[#0a66c2] text-white hover:bg-[#004a86]"
            }`}
          >
            Sign up
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#d4e5f6] bg-white shadow-lg">
          <ul className="space-y-1 p-3">
            {routes.map((route) => {
              const isActive = pathname === route.path;
              return (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    onClick={closeMenu}
                    className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border border-[#0a66c2] bg-[#e8f3ff] text-[#0a66c2]"
                        : "text-[#0a66c2] hover:bg-[#e7f3ff]"
                    }`}
                  >
                    {route.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/Auth/Login"
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  pathname === "/Auth/Login"
                    ? "border border-[#0a66c2] bg-[#e8f3ff] text-[#0a66c2]"
                    : "border border-[#0a66c2] text-[#0a66c2] hover:bg-[#e7f3ff]"
                }`}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/Auth/Signup"
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  pathname === "/Auth/Signup"
                    ? "border border-[#0a66c2] bg-[#e8f3ff] text-[#0a66c2]"
                    : "bg-[#0a66c2] text-white hover:bg-[#004a86]"
                }`}
              >
                Sign up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}


