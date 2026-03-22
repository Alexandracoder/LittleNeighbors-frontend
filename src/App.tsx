import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ChatWindow from './components/Chat/ChatWindow'

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
import 'leaflet/dist/leaflet.css'

const LoadingScreen = () => (
  <div
    style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#1a1a1a',
      color: 'white',
    }}
  >
    Cargando Vecinitos...
  </div>
)

function AppContent() {
  const { user, status, loading, token } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- RUTA DE CREACIÓN DE FAMILIA (Paso 1) --- */}
      <Route
        path="/create-family"
        element={
          <ProtectedRoute allowedRoles={['USER', 'FAMILY']}>
            <CreateFamily />
          </ProtectedRoute>
        }
      />

      {/* --- RUTA DE REGISTRO DE HIJOS (Paso 2) --- */}
      <Route
        path="/add-child"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            <AddChildPage />
          </ProtectedRoute>
        }
      />

      {/* --- RUTA DE CHAT (Nueva) --- */}
      <Route
        path="/chat/:matchId"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {status?.isRegistrationComplete ? (
              <ChatWindow currentUser={user} token={token} />
            ) : (
              <Navigate to="/add-child" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* --- RUTAS DE COMUNIDAD --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {status?.isRegistrationComplete ? (
              <Dashboard />
            ) : (
              <Navigate to="/add-child" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {status?.isRegistrationComplete ? (
              <ExplorePage />
            ) : (
              <Navigate to="/add-child" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {status?.isRegistrationComplete ? (
              <EventsPage />
            ) : (
              <Navigate to="/add-child" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules"
        element={
          <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
            {status?.isRegistrationComplete ? (
              <SchedulesPage />
            ) : (
              <Navigate to="/add-child" replace />
            )}
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
