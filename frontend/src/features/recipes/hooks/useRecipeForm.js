import { useEffect, useMemo, useState } from 'react'
import { createRecipe, updateRecipe } from '../services/recipeService'

const EMPTY_RECIPE = {
  title: '',
  description: '',
  cuisine: '',
  servings: '',
  prepTimeMinutes: '',
  cookTimeMinutes: '',
  imageUrl: '',
  ingredients: [{ name: '', quantity: '', unit: '' }],
  steps: [{ order: 1, instruction: '' }]
}

function normalizeRecipe(initialData) {
  if (!initialData) {
    return EMPTY_RECIPE
  }

  return {
    ...EMPTY_RECIPE,
    ...initialData,
    servings: initialData.servings ?? '',
    prepTimeMinutes: initialData.prepTimeMinutes ?? '',
    cookTimeMinutes: initialData.cookTimeMinutes ?? '',
    ingredients: initialData.ingredients?.length ? initialData.ingredients : EMPTY_RECIPE.ingredients,
    steps: initialData.steps?.length ? initialData.steps : EMPTY_RECIPE.steps
  }
}

export function useRecipeForm({ recipeId, initialData, onSaved }) {
  const [form, setForm] = useState(() => normalizeRecipe(initialData))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isEdit = useMemo(() => Boolean(recipeId), [recipeId])

  // Re-populate form when async initialData arrives (edit mode).
  // Deferred via Promise so setState is not called synchronously in the effect body.
  useEffect(() => {
    if (initialData) {
      Promise.resolve(normalizeRecipe(initialData)).then(setForm)
    }
  }, [initialData])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateIngredient(index, field, value) {
    setForm((prev) => {
      const next = [...prev.ingredients]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, ingredients: next }
    })
  }

  function updateStep(index, value) {
    setForm((prev) => {
      const next = [...prev.steps]
      next[index] = { ...next[index], instruction: value }
      return { ...prev, steps: next }
    })
  }

  function addIngredient() {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }))
  }

  function removeIngredient(index) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  function reorderIngredients(fromIndex, toIndex) {
    setForm((prev) => {
      const next = [...prev.ingredients]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { ...prev, ingredients: next }
    })
  }

  function addStep() {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { order: prev.steps.length + 1, instruction: '' }]
    }))
  }

  function removeStep(index) {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i + 1 }))
    }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.title.trim()) {
      nextErrors.title = 'Title is required'
    }
    if (!form.steps.some((step) => step.instruction.trim())) {
      nextErrors.steps = 'Add at least one step'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    if (!validate()) {
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        servings: form.servings ? Number(form.servings) : null,
        prepTimeMinutes: form.prepTimeMinutes ? Number(form.prepTimeMinutes) : null,
        cookTimeMinutes: form.cookTimeMinutes ? Number(form.cookTimeMinutes) : null,
        ingredients: form.ingredients.filter((i) => i.name.trim()),
        steps: form.steps
          .filter((s) => s.instruction.trim())
          .map((step, index) => ({ ...step, order: index + 1 }))
      }

      const saved = isEdit ? await updateRecipe(recipeId, payload) : await createRecipe(payload)
      onSaved(saved)
    } finally {
      setSaving(false)
    }
  }

  return {
    form,
    errors,
    saving,
    isEdit,
    updateField,
    updateIngredient,
    updateStep,
    addIngredient,
    removeIngredient,
    reorderIngredients,
    addStep,
    removeStep,
    submit
  }
}