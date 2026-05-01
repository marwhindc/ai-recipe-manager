export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm font-medium text-brand-cocoa">
      {label ? <span>{label}</span> : null}
      <select
        className={`w-full rounded-xl border border-[#e7cba8] bg-white px-3 py-2 text-sm outline-none ring-brand-rust transition focus:ring-2 disabled:bg-gray-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}