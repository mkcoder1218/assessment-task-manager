export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="h-10 w-64 bg-slate-200 rounded-md"></div>
        <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
      </div>

      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl border border-slate-100"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
