import { useCallback, useEffect, useState } from 'react'
import { listRecipes } from '../services/recipeService'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await listRecipes()
      setRecipes(payload?.data ?? [])
      setTotal(payload?.total ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { recipes, total, loading, error, refresh }
}