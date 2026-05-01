import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { useRecipes } from '../hooks/useRecipes'
import BottomNav from '../../../shared/components/BottomNav'

function AddRecipeSheet({ open, onClose, onStartFromScratch }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 animate-fade-in" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl bg-[#f5ede3] px-5 pb-10 pt-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-brand-cocoa">Add a recipe</h2>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-cocoa shadow"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-brand-cocoa/60">How would you like to start?</p>

        {/* Start from scratch + Import URL */}
        <div className="overflow-hidden rounded-2xl bg-white">
          <button
            className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-4 text-left"
            onClick={onStartFromScratch}
            type="button"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-sand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D14900" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-brand-cocoa">Start from scratch</p>
              <p className="text-sm text-brand-cocoa/50">Build your recipe step by step</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button
            className="flex w-full items-center gap-3 px-4 py-4 text-left opacity-40 cursor-not-allowed"
            type="button"
            disabled
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-sand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D14900" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-brand-cocoa">Import from URL</p>
              <p className="text-sm text-brand-cocoa/50">Coming soon</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Soon</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecipeListPage() {
  const { recipes, total, loading, error } = useRecipes()
  const navigate = useNavigate()
  const [showAddSheet, setShowAddSheet] = useState(false)

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-5 pb-28 pt-10">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-cocoa">Saffron</h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-brand-olive">Your Library</p>
          <p className="text-2xl font-bold text-brand-cocoa">{total} saved recipes</p>
        </div>
        <div className="h-11 w-11 overflow-hidden rounded-full bg-brand-sand">
          <img
            alt="Profile"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
          />
        </div>
      </header>

      {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <section className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="block overflow-hidden rounded-2xl">
              <div className="aspect-square overflow-hidden rounded-2xl bg-brand-sand animate-pulse" />
              <div className="mt-2 space-y-2 px-0.5">
                <div className="h-3 w-3/4 rounded-full bg-brand-sand animate-pulse" />
                <div className="h-3 w-1/3 rounded-full bg-brand-sand animate-pulse" />
              </div>
            </div>
          ))}
        </section>
      ) : recipes.length === 0 ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[#e8c9a3] bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-brand-cocoa">Start your cookbook</h2>
          <p className="mt-2 text-sm text-brand-cocoa/80">Create your first recipe to see it here.</p>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </section>
      )}

      {/* FAB */}
      <button
        aria-label="Add recipe"
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-rust shadow-card transition active:scale-95"
        onClick={() => setShowAddSheet(true)}
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <AddRecipeSheet
        open={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onStartFromScratch={() => { setShowAddSheet(false); navigate('/recipes/new') }}
      />

      <BottomNav />
    </main>
  )
}