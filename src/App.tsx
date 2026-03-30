import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ChatWindow from './components/Chat/ChatWindow'

// Pages & Components
import Login from './components/Login'
import Register from './components/Register'
import CreateFamily from './components/CreateFamily'
import Dashboard from './components/Dashboard'
import AddChildPage from './pages/AddChildren'
import ExplorePage from './pages/ExplorePage'
import EventsPage from './pages/EventsPage'
import SchedulesPage from './pages/SchedulesPage'
import Welcome from './pages/Welcome'
import 'leaflet/dist/leaflet.css'

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a1a] text-white">
    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-lg font-medium animate-pulse uppercase tracking-widest text-xs">
      Loading Neighborhood...
    </p>
  </div>
)

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" replace />}
      />

      {/* --- ONBOARDING Y COMUNIDAD (Todo bajo ProtectedRoute) --- */}

      {/* Paso 1: Crear Familia */}
      <Route
        path="/create-family"
        element={
          <ProtectedRoute>
            <CreateFamily />
          </ProtectedRoute>
        }
      />

      {/* Paso 2: Añadir Hijos */}
      <Route
        path="/add-child"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <AddChildPage />
          </ProtectedRoute>
        }
      />

      {/* Dashboard y resto de la App */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/explore"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <ExplorePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <EventsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:matchId"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <ChatWindow />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedules"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <SchedulesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/welcome"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <Welcome />
          </ProtectedRoute>
        }
      />

      {/* --- REDIRECCIÓN INICIAL --- */}
      {/* Simplemente mandamos a /dashboard. 
          El ProtectedRoute se encargará de interceptar y mandar a 
          /create-family o /add-child si el perfil no está listo.
      */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
