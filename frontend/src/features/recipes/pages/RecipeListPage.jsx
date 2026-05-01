import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { useRecipes } from '../hooks/useRecipes'
import { useAuth } from '../../user-auth/AuthContext'

export default function RecipeListPage() {
  const { recipes, total, loading, error, refresh } = useRecipes()
  const { user } = useAuth()
  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const cuisineFilters = useMemo(() => {
    const values = Array.from(new Set(recipes.map((recipe) => recipe.cuisine).filter(Boolean)))
    return ['All', ...values.slice(0, 8)]
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    const queryValue = query.trim().toLowerCase()

    return recipes.filter((recipe) => {
      const byCuisine = activeFilter === 'All' || recipe.cuisine === activeFilter

      if (!byCuisine) {
        return false
      }

      if (!queryValue) {
        return true
      }

      const inIngredients = (recipe.ingredients ?? []).some((item) =>
        item.name?.toLowerCase().includes(queryValue),
      )

      return (
        recipe.title?.toLowerCase().includes(queryValue) ||
        recipe.description?.toLowerCase().includes(queryValue) ||
        recipe.cuisine?.toLowerCase().includes(queryValue) ||
        inIngredients
      )
    })
  }, [activeFilter, query, recipes])

  return (
    <main className="px-6 pb-28 pt-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso">Saffron</h1>
        <Link
          className="h-10 w-10 overflow-hidden rounded-full border border-linen bg-parchment flex items-center justify-center"
          to="/profile"
        >
          {user?.avatarUrl ? (
            <img
              alt="Profile"
              className="h-full w-full object-cover"
              src={user.avatarUrl}
            />
          ) : (
            <span className="text-xs font-semibold text-taupe">{initials}</span>
          )}
        </Link>
      </header>

      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-taupe">Your Library</p>
        <p className="font-display text-2xl leading-tight text-espresso">{total} saved {total === 1 ? 'recipe' : 'recipes'}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" size={18} />
        <input
          className="hide-search-cancel w-full rounded-full border border-linen bg-white py-3 pl-11 pr-10 text-sm text-espresso shadow-sm outline-none transition focus:ring-2 focus:ring-paprika/40"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recipes, cuisine, ingredients..."
          type="search"
          value={query}
        />
        {query && (
          <button
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-taupe hover:bg-parchment"
            onClick={() => setQuery('')}
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {cuisineFilters.length > 1 && (
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 no-scrollbar">
          {cuisineFilters.map((filter) => {
            const active = filter === activeFilter

            return (
              <button
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-espresso bg-espresso text-cream'
                    : 'border-linen bg-white text-espresso hover:bg-parchment'
                }`}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            )
          })}
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700" onClick={refresh} type="button">
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <section className="grid grid-cols-2 gap-4 pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="block overflow-hidden rounded-2xl">
              <div className="aspect-square overflow-hidden rounded-2xl bg-parchment animate-pulse" />
              <div className="mt-2 space-y-2 px-0.5">
                <div className="h-3 w-3/4 rounded-full bg-parchment animate-pulse" />
                <div className="h-3 w-1/3 rounded-full bg-parchment animate-pulse" />
              </div>
            </div>
          ))}
        </section>
      ) : filteredRecipes.length === 0 ? (
        <section className="mt-4 rounded-3xl border border-dashed border-linen bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-espresso">No recipes found</h2>
          <p className="mt-2 text-sm text-taupe">
            {recipes.length === 0 ? 'Create your first recipe to see it here.' : 'Try a different search or filter.'}
          </p>
        </section>
      ) : (
        <motion.section
          animate="show"
          className="grid grid-cols-2 gap-4 pb-4"
          initial="hidden"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.04
              }
            }
          }}
        >
          {filteredRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.22 } }
              }}
            >
              <RecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </motion.section>
      )}
    </main>
  )
}