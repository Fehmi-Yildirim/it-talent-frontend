import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function Layout() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">Profile</Link>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main id="main-content">
        <Outlet />
      </main>
    </>
  )
}

export default Layout
