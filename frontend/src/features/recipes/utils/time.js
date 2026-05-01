export function totalTimeMinutes(recipe) {
  return (recipe?.prepTimeMinutes ?? 0) + (recipe?.cookTimeMinutes ?? 0)
}