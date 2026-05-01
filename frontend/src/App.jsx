import { Navigate, Route, Routes } from 'react-router-dom'
import RecipeDetailPage from './features/recipes/pages/RecipeDetailPage'
import RecipeFormPage from './features/recipes/pages/RecipeFormPage'
import RecipeListPage from './features/recipes/pages/RecipeListPage'

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/recipes" />} path="/" />
      <Route element={<RecipeListPage />} path="/recipes" />
      <Route element={<RecipeFormPage />} path="/recipes/new" />
      <Route element={<RecipeDetailPage />} path="/recipes/:id" />
      <Route element={<RecipeFormPage />} path="/recipes/:id/edit" />
    </Routes>
  )
}

export default App
