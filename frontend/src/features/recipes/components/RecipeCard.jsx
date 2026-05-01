import { Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import SourceBadge from './SourceBadge'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)

  return (
    <Link
      className="group flex cursor-pointer flex-col gap-2"
      to={`/recipe/${recipe.id}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-parchment shadow-sm transition-shadow group-hover:shadow-md">
        <img
          alt={recipe.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={recipe.imageUrl || PLACEHOLDER_IMAGE}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="space-y-1 px-1">
        <h3 className="line-clamp-2 font-display leading-tight text-espresso">{recipe.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-taupe">
          <div className="flex items-center gap-1">
            <Clock3 size={12} />
            <span>{totalTime}m</span>
          </div>
          {recipe.cuisine && <span>{recipe.cuisine}</span>}          {(recipe.source || recipe.sourceUrl) && (
            <span className="ml-auto">
              <SourceBadge source={recipe.source} sourceUrl={recipe.sourceUrl} variant="icon" />
            </span>
          )}        </div>
      </div>
    </Link>
  )
}