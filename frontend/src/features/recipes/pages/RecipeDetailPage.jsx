import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Clock3, Ellipsis, Pencil, Trash2, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteRecipe, getRecipe } from '../services/recipeService'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import LoadingOverlay from '../../../shared/components/LoadingOverlay'

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
      toast.success('Recipe deleted')
      navigate('/')
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  const steps = useMemo(
    () =>
      (recipe?.steps || [])
        .slice()
        .sort((a, b) => a.order - b.order),
    [recipe],
  )

  if (!recipe && !loading) {
    return (
      <main className="mx-auto w-full max-w-lg p-6">
        <p className="text-sm text-espresso">Recipe not found.</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-[440px] items-center justify-between px-6 pb-3 pt-5 pointer-events-auto">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-espresso shadow backdrop-blur-sm"
            onClick={() => navigate('/')}
            type="button"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Open recipe actions"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-espresso shadow backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!recipe}
            onClick={() => setShowMenu(true)}
            type="button"
          >
            <Ellipsis size={20} />
          </button>
        </div>
      </div>

      <div className="relative h-[340px] overflow-hidden bg-parchment">
        {recipe && (
          <img
            alt={recipe.title}
            className="h-full w-full object-cover"
            src={recipe.imageUrl || PLACEHOLDER_IMAGE}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      <div className="-mt-6 relative space-y-6 rounded-t-3xl bg-cream px-6 pb-10 pt-6">
        {loading && !recipe && (
          <>
            <div className="h-6 w-24 rounded-full bg-parchment animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-4/5 rounded-xl bg-parchment animate-pulse" />
              <div className="h-4 w-2/3 rounded-lg bg-parchment animate-pulse" />
            </div>

            <div className="grid grid-cols-3 divide-x divide-linen overflow-hidden rounded-2xl border border-linen bg-white shadow-sm">
              {[...Array(3)].map((_, idx) => (
                <div className="flex flex-col items-center py-4" key={idx}>
                  <div className="mb-2 h-5 w-5 rounded-full bg-parchment animate-pulse" />
                  <div className="h-2 w-10 rounded-full bg-parchment animate-pulse" />
                  <div className="mt-2 h-4 w-12 rounded-full bg-parchment animate-pulse" />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="h-6 w-36 rounded-xl bg-parchment animate-pulse" />
              {[...Array(4)].map((_, idx) => (
                <div className="flex items-center gap-4 py-2" key={`ingredient-skeleton-${idx}`}>
                  <div className="h-4 w-16 rounded-full bg-parchment animate-pulse" />
                  <div className="h-4 flex-1 rounded-full bg-parchment animate-pulse" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="h-6 w-40 rounded-xl bg-parchment animate-pulse" />
              {[...Array(3)].map((_, idx) => (
                <div className="flex gap-4" key={`step-skeleton-${idx}`}>
                  <div className="h-8 w-8 rounded-full bg-parchment animate-pulse" />
                  <div className="mt-2 h-4 flex-1 rounded-full bg-parchment animate-pulse" />
                </div>
              ))}
            </div>
          </>
        )}

        {recipe && (
          <>
            {recipe.cuisine && (
              <p className="inline-block rounded-full bg-paprika/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-paprika">
                {recipe.cuisine}
              </p>
            )}

            <h1 className="font-display text-3xl leading-tight text-espresso">{recipe.title}</h1>

            {recipe.description && (
              <p className="text-sm leading-relaxed text-taupe">{recipe.description}
              </p>
            )}

            <div className="grid grid-cols-3 divide-x divide-linen overflow-hidden rounded-2xl border border-linen bg-white shadow-sm">
              <div className="flex flex-1 flex-col items-center py-4">
                <Clock3 className="mb-1 text-paprika" size={18} />
                <p className="text-[10px] font-bold uppercase tracking-wide text-taupe">Prep</p>
                <p className="text-base font-bold text-espresso">{recipe.prepTimeMinutes ?? 0}m</p>
              </div>
              <div className="flex flex-1 flex-col items-center py-4">
                <Clock3 className="mb-1 text-paprika" size={18} />
                <p className="text-[10px] font-bold uppercase tracking-wide text-taupe">Cook</p>
                <p className="text-base font-bold text-espresso">{recipe.cookTimeMinutes ?? 0}m</p>
              </div>
              <div className="flex flex-1 flex-col items-center py-4">
                <Users className="mb-1 text-paprika" size={18} />
                <p className="text-[10px] font-bold uppercase tracking-wide text-taupe">Serves</p>
                <p className="text-base font-bold text-espresso">{recipe.servings || '—'}</p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl text-espresso">Ingredients</h2>
                <span className="text-sm text-taupe">
                  {(recipe.ingredients || []).length} items
                </span>
              </div>
              <div className="divide-y divide-linen">
                {(recipe.ingredients || []).map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="flex items-baseline gap-4 py-3">
                    <span className="w-20 shrink-0 text-sm font-semibold text-paprika">
                      {item.quantity
                        ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                        : '—'}
                    </span>
                    <span className="text-sm text-espresso">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl text-espresso">Instructions</h2>
                <span className="text-sm text-taupe">
                  {steps.length} steps
                </span>
              </div>
              <div className="space-y-5">
                {steps.map((step, idx) => (
                  <div key={step.order} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-espresso text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <p className="pt-1 text-sm leading-relaxed text-taupe">{step.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
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

      <AnimatePresence>
        {showMenu && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex items-end justify-center"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setShowMenu(false)}
          >
            <div className="absolute inset-0 bg-black/30" />
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white pb-8 pt-4"
              exit={{ y: 20, opacity: 0 }}
              initial={{ y: 30, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
              <button
                className="flex w-full items-center gap-4 px-6 py-4 text-left active:bg-gray-50"
                onClick={() => {
                  setShowMenu(false)
                  navigate(`/recipe/${id}/edit`)
                }}
                type="button"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-parchment text-paprika">
                  <Pencil size={18} />
                </div>
                <div>
                  <p className="font-semibold text-espresso">Edit recipe</p>
                </div>
              </button>
              <div className="mx-6 border-t border-linen" />
              <button
                className="flex w-full items-center gap-4 px-6 py-4 text-left active:bg-red-50"
                onClick={() => {
                  setShowMenu(false)
                  setShowConfirm(true)
                }}
                type="button"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Trash2 size={18} />
                </div>
                <div>
                  <p className="font-semibold text-red-600">Delete recipe</p>
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoadingOverlay show={loading} />
    </div>
  )
}