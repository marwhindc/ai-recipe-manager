export default function Modal({ open, title, children, onClose }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-brand-cocoa">{title}</h2>
          <button className="text-brand-cocoa" onClick={onClose} type="button">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}