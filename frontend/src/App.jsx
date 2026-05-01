import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import ComingSoonPage from './features/placeholder/pages/ComingSoonPage'
import RecipeDetailPage from './features/recipes/pages/RecipeDetailPage'
import RecipeFormPage from './features/recipes/pages/RecipeFormPage'
import RecipeImportPage from './features/recipes/pages/RecipeImportPage'
import RecipeListPage from './features/recipes/pages/RecipeListPage'
import { AuthProvider } from './features/user-auth/AuthContext'
import LoginPage from './features/user-auth/LoginPage'
import ProtectedRoute from './features/user-auth/ProtectedRoute'
import ProfilePage from './features/user-profile/ProfilePage'
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
          <Route element={<ProtectedRoute><RecipeListPage /></ProtectedRoute>} path="/" />
          <Route element={<ProtectedRoute><RecipeFormPage /></ProtectedRoute>} path="/recipe/new" />
          <Route element={<ProtectedRoute><RecipeImportPage /></ProtectedRoute>} path="/recipe/import" />
          <Route element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} path="/recipe/:id" />
          <Route element={<ProtectedRoute><RecipeFormPage /></ProtectedRoute>} path="/recipe/:id/edit" />

          <Route element={<ProtectedRoute><ComingSoonPage title="Collections" /></ProtectedRoute>} path="/collections" />
          <Route element={<ProtectedRoute><ComingSoonPage title="Grocery" /></ProtectedRoute>} path="/grocery" />
          <Route element={<ProtectedRoute><ComingSoonPage title="Discover" /></ProtectedRoute>} path="/discover" />
          <Route element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} path="/profile" />

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
    <AuthProvider>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route
          path="/*"
          element={
            <AppShell>
              <AnimatedRoutes />
            </AppShell>
          }
        />
      </Routes>
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
    </AuthProvider>
  )
}

export default App
