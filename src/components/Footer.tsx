export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-[#d4e5f6] bg-[#f7f9fc] py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-slate-600 md:flex-row md:px-6">
        <p>© {year} my-best</p>
        <p className="text-center md:text-right">Built with Next.js • OpenStreetMap • Modern search UX</p>
      </div>
    </footer>
  );
}


