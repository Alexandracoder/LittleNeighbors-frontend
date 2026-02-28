import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import CreateFamily from './components/CreateFamily';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';

function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roles.includes('ROLE_USER')) {
    return <Navigate to="/create-family" replace />;
  }

  if (user.roles.includes('ROLE_FAMILY') || user.roles.includes('ROLE_ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
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
              <ProtectedRoute allowedRoles={['ROLE_USER']}>
                <CreateFamily />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ROLE_FAMILY', 'ROLE_ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;
