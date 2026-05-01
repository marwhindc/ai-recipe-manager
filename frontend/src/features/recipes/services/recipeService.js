import { apiRequest, toQueryString } from '../../../lib/apiClient'

export function listRecipes(params = { page: 1, pageSize: 20 }) {
  return apiRequest(`/recipes${toQueryString(params)}`)
}

export function getRecipe(id) {
  return apiRequest(`/recipes/${id}`)
}

export function createRecipe(data) {
  return apiRequest('/recipes', { method: 'POST', body: data })
}

export function updateRecipe(id, data) {
  return apiRequest(`/recipes/${id}`, { method: 'PUT', body: data })
}

export function deleteRecipe(id) {
  return apiRequest(`/recipes/${id}`, { method: 'DELETE' })
}

export function importRecipeFromLink(sourceUrl) {
  return apiRequest('/recipes/import/video', { method: 'POST', body: { sourceUrl } })
}