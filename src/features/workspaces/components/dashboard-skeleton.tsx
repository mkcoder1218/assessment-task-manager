export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative h-56 overflow-hidden rounded-xl border border-border-subtle bg-surface-base shadow-sm">
            <div className="absolute inset-0 skeleton-shimmer"></div>
            <div className="relative z-10 space-y-6 p-5">
              <div className="flex justify-between items-start">
                <div className="h-6 w-32 rounded-lg bg-surface-muted"></div>
                <div className="h-10 w-10 rounded-lg bg-surface-muted"></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 rounded-lg bg-surface-muted"></div>
                <div className="h-16 rounded-lg bg-surface-muted"></div>
                <div className="h-16 rounded-lg bg-surface-muted"></div>
              </div>
              <div className="h-3 w-full rounded-lg bg-surface-muted"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
