export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-brand-rust text-white hover:bg-brand-cocoa',
    secondary: 'bg-brand-sand text-brand-cocoa hover:bg-[#f2d3ae]',
    ghost: 'bg-transparent text-brand-cocoa hover:bg-brand-sand/50',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}