import { useCallback, useEffect, useState } from 'react'
import { listRecipes } from '../services/recipeService'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  // refresh() is called from event handlers, never from effects
  const refresh = useCallback(() => {
    setLoading(true)
    setVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    listRecipes()
      .then((payload) => {
        if (!cancelled) {
          setRecipes(payload?.data ?? [])
          setTotal(payload?.total ?? 0)
          setLoading(false)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [version])

  return { recipes, total, loading, error, refresh }
}