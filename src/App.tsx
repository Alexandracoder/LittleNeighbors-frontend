import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import OnboardingGuard from './components/OnboardingGuard'
import ChatWindow from './components/Chat/ChatWindow'
import AddPlaydatePage from './pages/AddPlaydatePage'

import Login from './components/Login'
import Register from './components/Register'
import CreateFamily from './components/CreateFamily'
import Dashboard from './components/Dashboard'
import AddChildPage from './pages/AddChildren'
import ExplorePage from './pages/ExplorePage'
import EventsPage from './pages/EventsPage'
import SchedulesPage from './pages/SchedulesPage'
import Welcome from './pages/Welcome'
import { QrLandingPage } from './pages/QrLandingPage'

import 'leaflet/dist/leaflet.css'
import ChildDashboard from './components/ChildDashboard'
import { AdminDashboard } from './components/AdminDashboard'

const LoadingScreen = () => {
  const { t, ready } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F3] text-[#2D2D2D]">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-6"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 animate-pulse">
        {ready ? t('loading.verifyingNeighborhood') : 'LOADING...'}
      </p>
    </div>
  )
}

function ChatWrapper() {
  const { matchId } = useParams()
  const { user, token, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user || !token || !matchId) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="h-screen w-full bg-[#FDF8F3] p-4">
      <ChatWindow matchId={matchId} currentUser={user} token={token} />
    </div>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {user && <Navbar />}

      <div className={`${user ? 'pt-28' : ''}`}>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
                <OnboardingGuard>
                  <AddChildPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

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
              <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_FAMILY']}>
                <OnboardingGuard>
                  <Dashboard />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/explore"
            element={
              <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
                <OnboardingGuard>
                  <ExplorePage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route path="/child/:id" element={<ChildDashboard />} />

          <Route
            path="/events"
            element={
              <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
                <OnboardingGuard>
                  <EventsPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:matchId"
            element={
              <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
                <OnboardingGuard>
                  <ChatWrapper />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          {/* 1. Vista Contextual (La agenda compartida de un chat específico) */}
          <Route
            path="/schedules/:matchId"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <SchedulesPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          {/* 2. Vista Global*/}
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <SchedulesPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-playdate"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <AddPlaydatePage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/welcome"
            element={
              <ProtectedRoute allowedRoles={['ROLE_FAMILY']}>
                <OnboardingGuard>
                  <Welcome />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          {/* 🔓 La nueva landing del QR de la calle (Totalmente pública y libre) */}
          <Route path="/qr-pilot" element={<QrLandingPage />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/admin/stats" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
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
