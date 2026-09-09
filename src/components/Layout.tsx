import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useTranslation } from '../i18n/context'
import './Layout.css'

function Layout() {
  const { language, setLanguage, t } = useTranslation()
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
        {t('accessibility.skipToMainContent')}
      </a>

      <header className="site-header">
        <nav
          className="main-nav"
          aria-label={t('accessibility.mainNavigation')}
        >
          <Link className="main-nav__brand" to="/">
            IT Talent
          </Link>

          {isAuthenticated ? (
            <div className="main-nav__links">
              <NavLink to="/dashboard">
                {t('navigation.dashboard')}
              </NavLink>

              {isCandidate && (
                <NavLink to="/jobs">
                  {t('navigation.findJobs')}
                </NavLink>
              )}

              <NavLink to="/profile">
                {t('navigation.profile')}
              </NavLink>

              <div className="language-switcher">
                <select
                  id="language-select"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as typeof language)
                  }
                  aria-label="Language"
                >
                  <option value="en">EN</option>
                  <option value="nl">NL</option>
                </select>
              </div>

              <button
                className="main-nav__logout"
                type="button"
                onClick={handleLogout}
              >
                {t('navigation.logout')}
              </button>
            </div>
          ) : (
            <div className="main-nav__links">
              <NavLink to="/login">
                {t('navigation.login')}
              </NavLink>

              <NavLink to="/register">
                {t('navigation.register')}
              </NavLink>

              <div className="language-switcher">
                <select
                  id="language-select"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as typeof language)
                  }
                  aria-label="Language"
                >
                  <option value="en">EN</option>
                  <option value="nl">NL</option>
                </select>
              </div>
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
