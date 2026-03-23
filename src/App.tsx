import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Estilos globales y librerías
import 'leaflet/dist/leaflet.css'

// Páginas y Componentes
import Login from './components/Login'
import Register from './components/Register'
import CreateFamily from './components/CreateFamily'
import Dashboard from './components/Dashboard'
import AddChildPage from './pages/AddChildren'
import ExplorePage from './pages/ExplorePage'
import EventsPage from './pages/EventsPage'
import SchedulesPage from './pages/SchedulesPage'
import Welcome from './pages/Welcome'
import ChatPage from './pages/ChatPage'

// Pantalla de carga con estilo de marca
const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col justify-center items-center bg-brand-dark text-white space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-brand-orange"></div>
    <p className="font-black uppercase tracking-[0.3em] text-xs animate-pulse">
      Cargando Vecinitos...
    </p>
  </div>
)

function AppContent() {
  const { user, status, loading } = useAuth()

  if (loading) return <LoadingScreen />

  // Función auxiliar para proteger rutas que requieren registro completo
  const requireFullProfile = (element: JSX.Element) => {
    return status?.isRegistrationComplete ? (
      element
    ) : (
      <Navigate to="/add-child" replace />
    )
  }

  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- ONBOARDING (Flujo de registro) --- */}
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

      {/* --- APP CORE (Protegidas y con Perfil Completo) --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {requireFullProfile(<Dashboard />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/explore"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {requireFullProfile(<ExplorePage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {requireFullProfile(<EventsPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedules"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {requireFullProfile(<SchedulesPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:familyId"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {requireFullProfile(<ChatPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/welcome"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            <Welcome />
          </ProtectedRoute>
        }
      />

      {/* --- REDIRECCIONES ESTRATÉGICAS --- */}
      <Route
        path="/"
        element={
          user ? (
            status?.isRegistrationComplete ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/add-child" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all: Redirige cualquier error de tipeo al Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
