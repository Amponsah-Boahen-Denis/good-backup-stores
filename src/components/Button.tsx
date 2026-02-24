import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  const base = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const style =
    variant === "primary"
      ? "bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
      : "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20";
  return <button className={`${base} ${style} ${className}`} {...props} />;
}


