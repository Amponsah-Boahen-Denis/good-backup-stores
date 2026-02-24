"use client";

type Props = {
  value: "grid" | "list";
  onChange: (value: "grid" | "list") => void;
};

export default function LayoutToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border border-black/10 dark:border-white/15 overflow-hidden" role="group" aria-label="Toggle layout">
      <button
        type="button"
        aria-pressed={value === "grid"}
        className={`px-3 py-1.5 text-sm ${value === "grid" ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
        onClick={() => onChange("grid")}
      >
        Grid
      </button>
      <button
        type="button"
        aria-pressed={value === "list"}
        className={`px-3 py-1.5 text-sm border-l border-black/10 dark:border-white/15 ${value === "list" ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
        onClick={() => onChange("list")}
      >
        List
      </button>
    </div>
  );
}


