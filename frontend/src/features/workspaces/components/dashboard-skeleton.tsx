export function DashboardSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-surface-base rounded-2xl border border-border-subtle shadow-premium relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shimmer"></div>
            <div className="p-6 space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="h-6 w-32 bg-surface-muted rounded-lg"></div>
                <div className="h-4 w-12 bg-surface-muted rounded-lg"></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-surface-muted rounded-xl"></div>
                <div className="h-16 bg-surface-muted rounded-xl"></div>
                <div className="h-16 bg-surface-muted rounded-xl"></div>
              </div>
              <div className="h-4 w-full bg-surface-muted rounded-lg mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
