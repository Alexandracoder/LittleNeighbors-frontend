import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'

export const AppLayout = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-brand-cream">
      {user && <Navbar />}
      {/* El pt-28 solo si hay navbar, si no, el layout interno decide */}
      <main className={user ? 'pt-28' : ''}>
        <Outlet />
      </main>
    </div>
  )
}
