import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import CreateFamily from './components/CreateFamily'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/Register'
import AddChildPage from './components/AddChildPage' // Nombre sugerido para evitar conflictos

function RoleBasedRedirect() {
  const { user, loading } = useAuth()

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )

  if (!user) return <Navigate to="/login" replace />

  // Si ya es FAMILY, al Dashboard
  if (user.roles.includes('FAMILY') || user.roles.includes('ADMIN')) {
    return <Navigate to="/dashboard" replace />
  }

  // Si solo es USER, a crear familia
  return <Navigate to="/create-family" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/create-family"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
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

          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
