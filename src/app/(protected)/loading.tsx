export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse rounded-xl border border-border-subtle bg-surface-base p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-40 rounded bg-surface-muted"></div>
            <div className="h-8 w-64 rounded bg-surface-muted"></div>
            <div className="h-4 w-80 max-w-full rounded bg-surface-muted"></div>
          </div>
          <div className="h-11 w-full rounded-lg bg-surface-muted lg:w-96"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-xl border border-border-subtle bg-surface-base p-5 shadow-sm">
            <div className="mb-5 h-6 w-2/3 rounded bg-surface-muted"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded-lg bg-surface-muted"></div>
              <div className="h-16 rounded-lg bg-surface-muted"></div>
              <div className="h-16 rounded-lg bg-surface-muted"></div>
            </div>
            <div className="mt-6 h-3 rounded bg-surface-muted"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
