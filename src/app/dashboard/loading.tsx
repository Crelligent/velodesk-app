// src/app/dashboard/loading.tsx — VeloDesk dashboard skeleton
// Shown while supabase.auth.getUser() + data fetch resolves

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 animate-pulse">

      {/* Page header */}
      <div className="space-y-2">
        <div className="w-48 h-6 rounded-lg bg-white/[0.06]" />
        <div className="w-72 h-3 rounded bg-white/[0.04]" />
      </div>

      {/* PMF Score Hero */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-3">
          <div className="w-32 h-3 rounded bg-white/[0.06]" />
          <div className="w-20 h-12 rounded-xl bg-white/[0.06]" />
          <div className="w-64 h-3 rounded bg-white/[0.04]" />
        </div>
        <div className="grid grid-cols-2 gap-4 shrink-0">
          {['Retention', 'Engagement', 'Monetization', 'Growth'].map(label => (
            <div key={label} className="bg-white/[0.03] rounded-xl p-4 space-y-2 min-w-[120px]">
              <div className="w-20 h-2 rounded bg-white/[0.06]" />
              <div className="w-12 h-5 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-3 rounded bg-white/[0.06]" />
              <div className="w-5 h-5 rounded bg-white/[0.04]" />
            </div>
            <div className="w-20 h-7 rounded-lg bg-white/[0.06]" />
            <div className="w-28 h-2 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>

      {/* Signal Feed */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-32 h-4 rounded bg-white/[0.06]" />
          <div className="w-20 h-7 rounded-full bg-white/[0.04]" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-4 rounded-full bg-white/[0.06]" />
                <div className="w-40 h-3 rounded bg-white/[0.06]" />
              </div>
              <div className="w-full h-3 rounded bg-white/[0.04]" />
              <div className="w-2/3 h-3 rounded bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
