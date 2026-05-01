export default function LoadingOverlay({ show }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-40 bg-[#faf6f0]">
      <div className="h-72 w-full animate-pulse bg-brand-sand" />

      <div className="-mt-5 rounded-t-3xl bg-[#faf6f0] px-5 pb-28 pt-6 space-y-4">
        <div className="h-2.5 w-14 animate-pulse rounded-full bg-brand-sand" />
        <div className="h-8 w-3/5 animate-pulse rounded-xl bg-brand-sand" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-brand-sand" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-brand-sand" />
        </div>

        <div className="flex divide-x divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-card">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5 py-4">
              <div className="h-4 w-4 animate-pulse rounded-full bg-brand-sand" />
              <div className="h-2 w-8 animate-pulse rounded-full bg-brand-sand" />
              <div className="h-4 w-6 animate-pulse rounded-md bg-brand-sand" />
            </div>
          ))}
        </div>

        <div className="h-5 w-24 animate-pulse rounded-xl bg-brand-sand" />
        <div className="divide-y divide-gray-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-baseline gap-4 py-3">
              <div className="h-3 w-20 shrink-0 animate-pulse rounded-full bg-brand-sand" />
              <div className="h-3 flex-1 animate-pulse rounded-full bg-brand-sand" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}