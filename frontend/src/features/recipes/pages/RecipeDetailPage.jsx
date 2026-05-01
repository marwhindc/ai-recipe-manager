import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteRecipe, getRecipe } from '../services/recipeService'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import LoadingOverlay from '../../../shared/components/LoadingOverlay'
import BottomNav from '../../../shared/components/BottomNav'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    async function loadRecipe() {
      try {
        const payload = await getRecipe(id)
        setRecipe(payload)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteRecipe(id)
      navigate('/recipes')
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  const totalTime = recipe
    ? (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)
    : 0

  if (!recipe && !loading) {
    return (
      <main className="mx-auto w-full max-w-lg p-6">
        <p className="text-sm text-brand-cocoa">Recipe not found.</p>
      </main>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg min-h-screen bg-[#faf6f0]">
      {/* Hero image */}
      <div className="relative h-72 overflow-hidden bg-brand-sand">
        {recipe && (
          <img
            alt={recipe.title}
            className="h-full w-full object-cover"
            src={recipe.imageUrl || PLACEHOLDER_IMAGE}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent" />

        {/* Back button */}
        <div className="absolute left-4 top-12">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm"
            onClick={() => navigate('/recipes')}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A2D1F" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Ellipsis menu button */}
        <div className="absolute right-4 top-12">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm"
            onClick={() => setShowMenu(true)}
            type="button"
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#3A2D1F">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content card */}
      <div className="-mt-5 relative rounded-t-3xl bg-[#faf6f0] px-5 pb-28 pt-6">
        {recipe && (
          <>
            {/* Category */}
            {recipe.cuisine && (
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-rust">
                {recipe.cuisine}
              </p>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl font-bold leading-tight text-brand-cocoa">
              {recipe.title}
            </h1>

            {/* Description */}
            {recipe.description && (
              <p className="mt-2 text-sm leading-relaxed text-brand-cocoa/70">
                {recipe.description}
              </p>
            )}

            {/* Stats card */}
            <div className="my-5 flex items-stretch divide-x divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex flex-1 flex-col items-center py-4">
                <svg width="18" height="18" className="mb-1 text-brand-rust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Prep</p>
                <p className="text-base font-bold text-brand-cocoa">{recipe.prepTimeMinutes ?? 0}m</p>
              </div>
              <div className="flex flex-1 flex-col items-center py-4">
                <svg width="18" height="18" className="mb-1 text-brand-rust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a9 9 0 1 0 9 9" /><path d="M12 6v6l3 3" /><path d="M18 2v4h4" />
                </svg>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Cook</p>
                <p className="text-base font-bold text-brand-cocoa">{recipe.cookTimeMinutes ?? 0}m</p>
              </div>
              <div className="flex flex-1 flex-col items-center py-4">
                <svg width="18" height="18" className="mb-1 text-brand-rust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Serves</p>
                <p className="text-base font-bold text-brand-cocoa">{recipe.servings || '—'}</p>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-brand-cocoa">Ingredients</h2>
                <span className="text-sm text-brand-cocoa/50">
                  {(recipe.ingredients || []).length} items
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {(recipe.ingredients || []).map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="flex items-baseline gap-4 py-3">
                    <span className="w-20 shrink-0 text-sm font-semibold text-brand-rust">
                      {item.quantity
                        ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                        : '—'}
                    </span>
                    <span className="text-sm text-brand-cocoa">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-brand-cocoa">Instructions</h2>
                <span className="text-sm text-brand-cocoa/50">
                  {(recipe.steps || []).length} steps
                </span>
              </div>
              <div className="space-y-5">
                {(recipe.steps || [])
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((step, idx) => (
                    <div key={step.order} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-cocoa text-sm font-bold text-white">
                        {idx + 1}
                      </div>
                      <p className="pt-1 text-sm leading-relaxed text-brand-cocoa/80">
                        {step.instruction}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Edit button removed — now in ellipsis menu */}
          </>
        )}
      </div>

      <ConfirmDialog
        confirmText="Delete"
        description="Delete this recipe? This action cannot be undone."
        loading={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        open={showConfirm}
        title="Delete this recipe?"
      />

      {/* Ellipsis bottom sheet */}
      {showMenu && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setShowMenu(false)}>
          <div className="absolute inset-0 bg-black/30 animate-fade-in" />
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white pb-8 pt-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag indicator */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <button
              className="flex w-full items-center gap-4 px-6 py-4 text-left active:bg-gray-50"
              onClick={() => { setShowMenu(false); navigate(`/recipes/${id}/edit`) }}
              type="button"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D14900" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-brand-cocoa">Edit Recipe</p>
                <p className="text-sm text-brand-cocoa/50">Update ingredients, steps, or details</p>
              </div>
            </button>
            <div className="mx-6 border-t border-gray-100" />
            <button
              className="flex w-full items-center gap-4 px-6 py-4 text-left active:bg-red-50"
              onClick={() => { setShowMenu(false); setShowConfirm(true) }}
              type="button"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-600">Delete Recipe</p>
                <p className="text-sm text-brand-cocoa/50">This action cannot be undone</p>
              </div>
            </button>
          </div>
        </div>
      )}

      <LoadingOverlay show={loading} />
      <BottomNav />
    </div>
  )
}