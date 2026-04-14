import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ChatWindow from './components/Chat/ChatWindow'
import AddPlaydatePage from './pages/AddPlaydatePage'

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

function ChatWrapper() {
  const { matchId } = useParams()
  const { user, token, loading } = useAuth()


  if (loading) return <LoadingScreen />


  console.log('ChatWrapper Check:', {
    matchId,
    hasUser: !!user,
    hasToken: !!token,
  })

  if (!user || !token || !matchId) {

    console.error('Redirigiendo a dashboard porque falta:', {
      user,
      token,
      matchId,
    })
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="h-screen w-full bg-[#1a1a1a] p-4">
      <ChatWindow matchId={matchId} currentUser={user} token={token} />
    </div>
  )
}

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

      {/* --- ONBOARDING Y COMUNIDAD --- */}
      <Route
        path="/create-family"
        element={
          <ProtectedRoute>
            <CreateFamily />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-child"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <AddChildPage />
          </ProtectedRoute>
        }
      />

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
            <ChatWrapper />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedules/:matchId"
        element={
          <ProtectedRoute>
            <SchedulesPage />
          </ProtectedRoute>
        }
      />
      <Route path="/add-playdate" element={<AddPlaydatePage />} />

      <Route
        path="/welcome"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
            <Welcome />
          </ProtectedRoute>
        }
      />

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
