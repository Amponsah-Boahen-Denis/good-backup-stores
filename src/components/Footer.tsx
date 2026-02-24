export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 mt-10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between text-sm text-black/70 dark:text-white/70">
        <p>© {year} my-best</p>
        <p className="hidden sm:block">Built with Next.js</p>
      </div>
    </footer>
  );
}


