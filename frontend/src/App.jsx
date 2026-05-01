import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import ComingSoonPage from './features/placeholder/pages/ComingSoonPage'
import RecipeDetailPage from './features/recipes/pages/RecipeDetailPage'
import RecipeFormPage from './features/recipes/pages/RecipeFormPage'
import RecipeListPage from './features/recipes/pages/RecipeListPage'
import AppShell from './shared/components/AppShell'

function LegacyRecipeDetailRedirect() {
  const { id } = useParams()
  return <Navigate replace to={`/recipe/${id}`} />
}

function LegacyRecipeEditRedirect() {
  const { id } = useParams()
  return <Navigate replace to={`/recipe/${id}/edit`} />
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route element={<RecipeListPage />} path="/" />
          <Route element={<RecipeFormPage />} path="/recipe/new" />
          <Route element={<RecipeDetailPage />} path="/recipe/:id" />
          <Route element={<RecipeFormPage />} path="/recipe/:id/edit" />

          <Route element={<ComingSoonPage title="Collections" />} path="/collections" />
          <Route element={<ComingSoonPage title="Grocery" />} path="/grocery" />
          <Route element={<ComingSoonPage title="Discover" />} path="/discover" />
          <Route element={<ComingSoonPage title="Profile" />} path="/profile" />

          <Route element={<Navigate replace to="/" />} path="/recipes" />
          <Route element={<Navigate replace to="/recipe/new" />} path="/recipes/new" />
          <Route element={<LegacyRecipeDetailRedirect />} path="/recipes/:id" />
          <Route element={<LegacyRecipeEditRedirect />} path="/recipes/:id/edit" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            borderRadius: '14px',
            fontFamily: 'Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif'
          }
        }}
      />
    </>
  )
}

export default App
