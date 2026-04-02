"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 right-5 z-50 rounded-full border-2 border-[#0a66c2] bg-white px-4 py-3 text-sm font-semibold text-[#0a66c2] shadow-lg transition hover:bg-[#e7f3ff]"
      aria-label="Scroll back to top"
    >
      ↑ Back to top
    </button>
  );
}
