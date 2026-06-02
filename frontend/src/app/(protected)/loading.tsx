export default function Loading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between">
              <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
              <div className="h-6 w-10 bg-slate-100 rounded-full"></div>
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-3 w-full bg-slate-50 rounded"></div>
              <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
