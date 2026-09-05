import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import './Layout.css'

function Layout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const isCandidate = user?.role === 'CANDIDATE'

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="main-nav__brand" to="/">
            IT Talent
          </Link>

          {isAuthenticated ? (
            <div className="main-nav__links">
              <NavLink to="/dashboard">Dashboard</NavLink>

              {isCandidate && (
                <NavLink to="/jobs">Find jobs</NavLink>
              )}

              <NavLink to="/profile">Profile</NavLink>

              <button
                className="main-nav__logout"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="main-nav__links">
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </div>
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