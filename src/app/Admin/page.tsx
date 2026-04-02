import AdminFeature from "@/features/Admin/Admin";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14 lg:py-16">
      <div className="rounded-2xl border border-[#dce6f3] bg-white/90 p-4 shadow-sm md:p-6">
        <AdminFeature />
      </div>
    </main>
  );
}


