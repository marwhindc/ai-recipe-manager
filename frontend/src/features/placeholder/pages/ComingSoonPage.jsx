export default function ComingSoonPage({ title }) {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center px-6">
      <div className="w-full rounded-3xl border border-linen bg-white p-8 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-olive">{title}</p>
        <h1 className="mt-2 font-display text-3xl text-espresso">Coming soon</h1>
      </div>
    </section>
  )
}