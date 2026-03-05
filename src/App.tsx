import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import CreateFamily from './components/CreateFamily'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/Register'
import AddChildPage from './components/AddChildPage'
import ExplorePage from './pages/ExplorePage'

function RoleBasedRedirect() {
  const { user, loading } = useAuth()

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
      </div>
    )

  if (!user) return <Navigate to="/login" replace />

  const roles = user.roles || []
  // Cambiamos la lógica: si es FAMILY pero acaba de ser actualizado,
  // permitimos que el flujo decida.
  const hasAccess = roles.includes('FAMILY') || roles.includes('ADMIN')

  if (hasAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/create-family" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* CAMBIO CLAVE: Permitimos 'FAMILY' en create-family para que 
              no te eche de la página justo cuando el backend te cambia el rol 
          */}
          <Route
            path="/create-family"
            element={
              <ProtectedRoute allowedRoles={['USER', 'FAMILY']}>
                <CreateFamily />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-child"
            element={
              <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
                <AddChildPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/explore"
            element={
              <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
                <ExplorePage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
