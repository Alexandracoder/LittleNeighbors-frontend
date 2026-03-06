import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import CreateFamily from './components/CreateFamily'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/Register'
import AddChildPage from './pages/AddChildren'
import ExplorePage from './pages/ExplorePage'

function RoleBasedRedirect() {
  const { user, familyEntity, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  const roles = user.roles || []

  // Verificamos si la familia tiene niños.
  const hasChildren = familyEntity?.children && familyEntity.children.length > 0

  if (roles.includes('ADMIN')) {
    return location.pathname !== '/dashboard' ? (
      <Navigate to="/dashboard" replace />
    ) : null
  }

  if (roles.includes('FAMILY')) {
    if (!hasChildren && location.pathname !== '/add-child') {
      return <Navigate to="/add-child" replace />
    }
    if (hasChildren && location.pathname !== '/dashboard') {
      return <Navigate to="/dashboard" replace />
    }
    // Si el usuario ya está donde debe, salimos de la función aquí.
    return null
  }

  // Ahora, este bloque solo afectará a los que NO son FAMILY ni ADMIN
  if (location.pathname !== '/create-family') {
    return <Navigate to="/create-family" replace />
  }

  return null
} // <--- AÑADIDA: Esta llave cerraba mal la función

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

          {/* El redirect raíz decide a dónde ir según el estado del usuario */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
