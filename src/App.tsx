import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import CreateFamily from './components/CreateFamily'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './components/Register'
import AddChildPage from './pages/AddChildren'
import ExplorePage from './pages/ExplorePage'
import EventsPage from './pages/EventsPage'
import SchedulesPage from './pages/SchedulesPage'
import Welcome from './pages/Welcome'
const LoadingScreen = () => (
  <div style={{ padding: '20px', color: 'white' }}>Cargando aplicación...</div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Protegidas */}
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

          <Route
            path="/events"
            element={
              <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
                <EventsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedules"
            element={
              <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
                <SchedulesPage />
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

          {/* Redirección raíz segura */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
