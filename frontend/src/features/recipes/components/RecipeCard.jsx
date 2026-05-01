import { Link } from 'react-router-dom'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)

  return (
    <Link
      className="group block overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-card"
      to={`/recipes/${recipe.id}`}
    >
      <div className="aspect-square overflow-hidden rounded-2xl">
        <img
          alt={recipe.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={recipe.imageUrl || PLACEHOLDER_IMAGE}
        />
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-brand-cocoa">
          {recipe.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {recipe.cuisine && (
            <span className="rounded-full bg-brand-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-rust">
              {recipe.cuisine}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{totalTime}m</span>
          </div>
        </div>
      </div>
    </Link>
  )
}