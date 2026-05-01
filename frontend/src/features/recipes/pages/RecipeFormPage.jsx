import { useEffect, useRef, useState } from 'react'
import { Camera, GripVertical, Plus, Trash2, X } from 'lucide-react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getRecipe } from '../services/recipeService'
import { useRecipeForm } from '../hooks/useRecipeForm'
import LoadingOverlay from '../../../shared/components/LoadingOverlay'

export default function RecipeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const importedDraft = location.state?.draft ?? null
  const [initialData, setInitialData] = useState(importedDraft)
  const [loading, setLoading] = useState(Boolean(id))
  const [showImageInput, setShowImageInput] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const rowRefs = useRef([])
  const fileInputRef = useRef(null)

  function handleImageFile(file) {
    if (!file) return
    const MAX_PX = 900
    const QUALITY = 0.82
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        updateField('imageUrl', canvas.toDataURL('image/jpeg', QUALITY))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!id) {
      return
    }

    async function loadRecipe() {
      try {
        const payload = await getRecipe(id)
        setInitialData(payload)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [id])

  const {
    form, errors, saving, isEdit,
    updateField, updateIngredient, updateStep,
    addIngredient, removeIngredient, reorderIngredients, addStep, removeStep, submit
  } = useRecipeForm({
    recipeId: id,
    initialData,
    onSaved: (savedRecipe) => navigate(`/recipe/${savedRecipe.id}`)
  })

  return (
    <div className="mx-auto w-full max-w-lg min-h-screen bg-cream pb-28">
      <div className="flex items-center justify-between px-4 pb-4 pt-5">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-linen bg-white text-espresso shadow-sm"
          onClick={() => navigate(id ? `/recipe/${id}` : '/')}
          type="button"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <h1 className="font-display text-lg text-espresso">
          {isEdit ? 'Edit Recipe' : 'New Recipe'}
        </h1>
        <div aria-hidden="true" className="h-10 w-10" />
      </div>

      <form className="space-y-5" id="recipe-form" onSubmit={submit}>
        {/* Cover photo */}
        <div className="mx-4">
          {/* Hidden file input — accepts gallery + camera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleImageFile(e.target.files?.[0])}
          />

          {/* Preview / placeholder tap area */}
          <div className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-linen bg-white">
            {form.imageUrl ? (
              <>
                <img alt="Cover" className="h-44 w-full object-cover" src={form.imageUrl} />
                {/* Overlay actions when image is set */}
                <div className="absolute inset-0 flex items-end justify-end gap-2 p-3">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={12} />
                    Change
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
                    onClick={() => updateField('imageUrl', '')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-espresso/40">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <p className="mt-2 text-sm font-medium">Add cover photo</p>
                {/* Two action buttons when empty */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-[#e0c9a8] bg-white px-4 py-2 text-xs font-semibold text-brand-cocoa shadow-sm"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.removeAttribute('capture')
                        fileInputRef.current.click()
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-linen bg-white px-4 py-2 text-xs font-semibold text-espresso shadow-sm"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment')
                        fileInputRef.current.click()
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Camera
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-linen bg-white px-4 py-2 text-xs font-semibold text-espresso shadow-sm"
                    onClick={() => setShowImageInput((v) => !v)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    URL
                  </button>
                </div>
              </div>
            )}
          </div>

          {showImageInput && !form.imageUrl && (
            <div className="mt-2">
              <input
                className="w-full rounded-xl border border-linen bg-white px-3 py-2 text-sm outline-none ring-paprika focus:ring-2"
                placeholder="Paste image URL..."
                value={form.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mx-4 border-b-2 border-parchment pb-2 transition-colors focus-within:border-paprika">
          <input
            className="w-full bg-transparent font-display text-3xl text-espresso placeholder-espresso/25 outline-none"
            placeholder="Recipe name…"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="mx-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-espresso/40">Description</p>
          <textarea
            className="w-full rounded-xl border border-linen bg-white px-3 py-2 text-sm text-espresso placeholder-espresso/30 outline-none ring-paprika focus:ring-2"
            placeholder="Describe your recipe..."
            rows={3}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        {/* Serves + Prep Time + Cook Time steppers */}
        <div className="mx-4 grid grid-cols-3 gap-2">
          {/* Serves */}
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-linen bg-white px-2 py-4">
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6e7d45" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <p className="text-[9px] font-bold uppercase tracking-widest text-espresso/50">Serves</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-linen text-espresso"
                onClick={() => updateField('servings', Math.max(1, (Number(form.servings) || 0) - 1))}
              >
                <span className="text-base leading-none">−</span>
              </button>
              <span className="w-6 text-center text-lg font-bold text-espresso">{form.servings || 0}</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-linen text-espresso"
                onClick={() => updateField('servings', (Number(form.servings) || 0) + 1)}
              >
                <span className="text-base leading-none">+</span>
              </button>
            </div>
          </div>

          {/* Prep Time */}
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-linen bg-white px-2 py-4">
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6e7d45" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <p className="text-[9px] font-bold uppercase tracking-widest text-espresso/50">Prep</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-linen text-espresso"
                onClick={() => updateField('prepTimeMinutes', Math.max(0, (Number(form.prepTimeMinutes) || 0) - 5))}
              >
                <span className="text-base leading-none">−</span>
              </button>
              <span className="w-8 text-center text-lg font-bold text-espresso">{form.prepTimeMinutes || 0}m</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-linen text-espresso"
                onClick={() => updateField('prepTimeMinutes', (Number(form.prepTimeMinutes) || 0) + 5)}
              >
                <span className="text-base leading-none">+</span>
              </button>
            </div>
          </div>

          {/* Cook Time */}
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-linen bg-white px-2 py-4">
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6e7d45" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <p className="text-[9px] font-bold uppercase tracking-widest text-espresso/50">Cook</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-linen text-espresso"
                onClick={() => updateField('cookTimeMinutes', Math.max(0, (Number(form.cookTimeMinutes) || 0) - 5))}
              >
                <span className="text-base leading-none">−</span>
              </button>
              <span className="w-8 text-center text-lg font-bold text-espresso">{form.cookTimeMinutes || 0}m</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-linen text-espresso"
                onClick={() => updateField('cookTimeMinutes', (Number(form.cookTimeMinutes) || 0) + 5)}
              >
                <span className="text-base leading-none">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mx-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-espresso">Ingredients</h2>
            <span className="text-sm text-taupe">
              {form.ingredients.filter((i) => i.name).length} added
            </span>
          </div>
          <div className="space-y-2">
            {form.ingredients.map((ingredient, index) => (
              <div
                ref={(el) => { rowRefs.current[index] = el }}
                className={[
                  'flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 transition-all',
                  overIdx === index && dragIdx !== null && dragIdx !== index
                    ? 'border-paprika scale-[1.01] shadow-card'
                    : 'border-linen',
                  dragIdx === index ? 'opacity-50' : 'opacity-100'
                ].join(' ')}
                key={`ingredient-${index}`}
              >
                {/* Drag handle using pointer events — works on touch and mouse */}
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    className="cursor-grab touch-none p-1 text-gray-300 active:cursor-grabbing"
                    aria-label="Drag to reorder"
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId)
                      setDragIdx(index)
                      setOverIdx(index)
                    }}
                    onPointerMove={(e) => {
                      if (dragIdx !== index) return
                      const y = e.clientY
                      let target = index
                      rowRefs.current.forEach((el, i) => {
                        if (!el) return
                        const rect = el.getBoundingClientRect()
                        if (y >= rect.top && y <= rect.bottom) target = i
                      })
                      if (target !== overIdx) setOverIdx(target)
                    }}
                    onPointerUp={() => {
                      if (dragIdx === index) {
                        if (overIdx !== null && overIdx !== dragIdx) {
                          reorderIngredients(dragIdx, overIdx)
                        }
                        setDragIdx(null)
                        setOverIdx(null)
                      }
                    }}
                    onPointerCancel={() => { setDragIdx(null); setOverIdx(null) }}
                  >
                    <GripVertical size={14} />
                  </button>
                </div>
                <input
                  className="w-10 shrink-0 bg-transparent text-sm font-semibold text-paprika outline-none placeholder-paprika/40"
                  placeholder="qty"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                />
                <input
                  className="w-14 shrink-0 bg-transparent text-sm font-semibold text-paprika outline-none placeholder-paprika/40"
                  placeholder="unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                />
                <div className="h-5 w-px shrink-0 bg-gray-200" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-espresso outline-none placeholder-espresso/30"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                />
                <button
                  type="button"
                  className="shrink-0 p-2 text-gray-300 hover:text-red-400 active:text-red-500 touch-manipulation"
                  onClick={() => removeIngredient(index)}
                  aria-label="Remove ingredient"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-2xl border border-dashed border-linen py-3 text-sm font-semibold text-paprika"
            onClick={addIngredient}
          >
            <span className="inline-flex items-center gap-1">
              <Plus size={14} /> Add ingredient
            </span>
          </button>
        </div>

        {/* Steps */}
        <div className="mx-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-espresso">Steps</h2>
            <span className="text-sm text-taupe">
              {form.steps.filter((s) => s.instruction).length} added
            </span>
          </div>
          {errors.steps && <p className="mb-2 text-xs text-red-600">{errors.steps}</p>}
          <div className="space-y-2">
            {form.steps.map((step, index) => (
              <div
                className="flex gap-3 overflow-hidden rounded-2xl border border-linen bg-white px-3 py-3"
                key={`step-${index}`}
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-espresso text-xs font-bold text-white">
                  {index + 1}
                </div>
                <textarea
                  className="flex-1 resize-none bg-transparent text-sm text-espresso outline-none placeholder-espresso/30"
                  placeholder="Describe this step..."
                  rows={2}
                  value={step.instruction}
                  onChange={(e) => updateStep(index, e.target.value)}
                />
                <button
                  type="button"
                  className="mt-0.5 shrink-0 self-start text-gray-300 hover:text-red-400"
                  onClick={() => removeStep(index)}
                  aria-label="Remove step"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-2xl border border-dashed border-linen py-3 text-sm font-semibold text-paprika"
            onClick={addStep}
          >
            <span className="inline-flex items-center gap-1">
              <Plus size={14} /> Add step
            </span>
          </button>
        </div>

        {/* Cuisine */}
        <div className="mx-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-espresso/40">Cuisine</p>
          <select
            className="w-full rounded-xl border border-linen bg-white px-3 py-2 text-sm text-espresso outline-none ring-paprika focus:ring-2"
            value={form.cuisine}
            onChange={(e) => updateField('cuisine', e.target.value)}
          >
            <option value="">Select cuisine</option>
            <option value="Filipino">Filipino</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
            <option value="Mexican">Mexican</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Save button — inside the form, at the bottom */}
        <div className="mx-4 pb-4">
          <button
            className="w-full rounded-2xl bg-paprika py-4 text-sm font-semibold text-white shadow-lg shadow-paprika/30 transition active:scale-[0.98] disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Recipe'}
          </button>
        </div>
      </form>

      <LoadingOverlay show={loading} />
    </div>
  )
}