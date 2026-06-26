import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  Outlet,
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
import ChildDashboard from './components/ChildDashboard'
import { AdminDashboard } from './components/AdminDashboard'
import AdminModerationTable from './components/AdminModerationTable'
import 'leaflet/dist/leaflet.css'
import ForgotPassword from './components/ForgotPassword'
import ResetPasswordPage from './pages/ResetPasswordPage'

const LoadingScreen = () => {
  const { t, ready } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F3] text-[#2D2D2D]">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-6" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 animate-pulse">
        {ready ? t('loading.verifyingNeighborhood') : 'LOADING...'}
      </p>
    </div>
  )
}

function AppLayout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {user && <Navbar />}
      <main className={user ? 'pt-28' : ''}>
        <Outlet />
      </main>
    </div>
  )
}

function ChatWrapper() {
  const { matchId } = useParams()
  const { user, token, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || !token || !matchId) return <Navigate to="/dashboard" replace />
  return (
    <div className="h-screen w-full bg-[#FDF8F3] p-4">
      <ChatWindow matchId={matchId} currentUser={user} token={token} />
    </div>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  const getHomeRoute = (roles: string[] = []) =>
    roles.some(r => r.includes('ADMIN')) ? '/admin/stats' : '/dashboard'

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !user ? <Login /> : <Navigate to={getHomeRoute(user.roles)} replace />
        }
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" replace />}
      />
      <Route path="/qr-landing" element={<QrLandingPage />} />

      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={getHomeRoute(user.roles)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

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
        <Route
          path="/admin/stats"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}>
              <AdminModerationTable />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
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
