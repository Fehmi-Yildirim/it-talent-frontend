
import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useTranslation } from '../i18n/useTranslation'
import './Layout.css'

type Translation = ReturnType<typeof useTranslation>
type AuthUser = ReturnType<typeof useAuth>['user']

type LanguageSwitcherProps = {
  language: Translation['language']
  setLanguage: Translation['setLanguage']
  t: Translation['t']
}

function LanguageSwitcher({
  language,
  setLanguage,
  t,
}: LanguageSwitcherProps) {
  return (
    <div className="language-switcher">
      <select
        id="language-select"
        value={language}
        onChange={(event) =>
          setLanguage(event.target.value as typeof language)
        }
        aria-label={t('common.language')}
      >
        <option value="en">EN</option>
        <option value="nl">NL</option>
      </select>
    </div>
  )
}

type UserActionsProps = {
  user: AuthUser
  onLogout: () => void
  logoutLabel: string
}

function UserActions({
  user,
  onLogout,
  logoutLabel,
}: UserActionsProps) {
  return (
    <div className="main-nav__user-actions">
      <span className="main-nav__user">
        <span aria-hidden="true">👤</span>
        {user?.firstName} {user?.lastName}
        {user?.isDemo && (
          <span className="demo-badge">DEMO</span>
        )}
      </span>

      <button
        className="main-nav__logout"
        type="button"
        onClick={onLogout}
      >
        {logoutLabel}
      </button>
    </div>
  )
}

function Layout() {
  const { language, setLanguage, t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const [isAdminNavOpen, setIsAdminNavOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.innerWidth <= 820
  )

  const isAdmin = user?.role === 'ADMIN'
  const isCandidate = user?.role === 'CANDIDATE'
  const isRecruiter = user?.role === 'RECRUITER'

  // Lock body scrolling while a mobile navigation drawer is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const shouldLockScroll = isMobileNavOpen || isAdminNavOpen

    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileNavOpen, isAdminNavOpen])

  // Close navigation drawers when switching to desktop.
  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth <= 820

      setIsMobileViewport(isMobile)

      if (!isMobile) {
        setIsMobileNavOpen(false)
        setIsAdminNavOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Close navigation drawers with the Escape key.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false)
        setIsAdminNavOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function handleLogout() {
    logout()
    setIsMobileNavOpen(false)
    setIsAdminNavOpen(false)
    navigate('/login', { replace: true })
  }

  function closeAdminNav() {
    setIsAdminNavOpen(false)
  }

  function closeMobileNav() {
    setIsMobileNavOpen(false)
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `main-nav__link${isActive ? ' active' : ''}`

  const languageSwitcher = (
    <LanguageSwitcher
      language={language}
      setLanguage={setLanguage}
      t={t}
    />
  )

  const userActions = (
    <UserActions
      user={user}
      onLogout={handleLogout}
      logoutLabel={t('common.logout')}
    />
  )

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('accessibility.skipToMainContent')}
      </a>

      {isAuthenticated && isAdmin ? (
        <div className="app-shell app-shell--admin">
          <aside
            className={`admin-sidebar${isAdminNavOpen ? ' is-open' : ''}`}
            id="admin-navigation"
            inert={isMobileViewport && !isAdminNavOpen}
          >
            <Link
              className="admin-sidebar__brand"
              to="/admin/users"
              onClick={closeAdminNav}
            >
              <span className="admin-sidebar__brand-mark">IT</span>
              <span>IT Talent</span>
            </Link>

            <div className="admin-sidebar__section">
              <span className="admin-sidebar__label">
                {t('dashboard.admin.administration')}
              </span>

              <nav
                className="admin-sidebar__nav"
                aria-label={t('accessibility.mainNavigation')}
              >
                {/* Home navigation */}
                <NavLink
                  to="/"
                  className={navLinkClass}
                  onClick={closeAdminNav}
                >
                  <span aria-hidden="true">⌂</span>
                  {t('common.home')}
                </NavLink>

                <NavLink
                  to="/admin/users"
                  className={navLinkClass}
                  onClick={closeAdminNav}
                >
                  <span aria-hidden="true">👥</span>
                  {t('dashboard.admin.manageUsers')}
                </NavLink>

                <NavLink
                  to="/admin/skills"
                  className={navLinkClass}
                  onClick={closeAdminNav}
                >
                  <span aria-hidden="true">✦</span>
                  {t('dashboard.admin.manageSkills')}
                </NavLink>
              </nav>
            </div>

            <div className="admin-sidebar__footer">
              <NavLink
                to="/profile"
                className={navLinkClass}
                onClick={closeAdminNav}
              >
                <span aria-hidden="true">⚙</span>
                {t('common.profile')}
              </NavLink>
            </div>

            <div className="admin-sidebar__mobile-actions">
              {languageSwitcher}
              {userActions}
            </div>
          </aside>

          {isAdminNavOpen && (
            <button
              className="admin-sidebar__overlay"
              type="button"
              aria-label={t('accessibility.closeNavigation')}
              onClick={closeAdminNav}
            />
          )}

          <div className="admin-main">
            <header className="admin-topbar">
              <button
                className="admin-topbar__menu"
                type="button"
                aria-label={t('accessibility.toggleNavigation')}
                aria-expanded={isAdminNavOpen}
                aria-controls="admin-navigation"
                onClick={() =>
                  setIsAdminNavOpen((isOpen) => !isOpen)
                }
              >
                <span aria-hidden="true">☰</span>
              </button>

              <div className="admin-topbar__right">
                {languageSwitcher}
                {userActions}
              </div>
            </header>

            <main id="main-content" className="app-content">
              <Outlet />
            </main>
          </div>
        </div>
      ) : (
        <div className="app-shell">
          <header className="site-header">
            <nav
              className="main-nav"
              aria-label={t('accessibility.mainNavigation')}
            >
              <Link
                className="main-nav__brand"
                to="/"
                onClick={closeMobileNav}
              >
                IT Talent
              </Link>

              <button
                className="main-nav__mobile-toggle"
                type="button"
                aria-label={
                  isMobileNavOpen
                    ? t('accessibility.closeNavigation')
                    : t('accessibility.openNavigation')
                }
                aria-expanded={isMobileNavOpen}
                aria-controls="main-mobile-navigation"
                onClick={() =>
                  setIsMobileNavOpen((isOpen) => !isOpen)
                }
              >
                <span aria-hidden="true">
                  {isMobileNavOpen ? '×' : '☰'}
                </span>
              </button>

              <div
                className={`main-nav__mobile-panel${isMobileNavOpen ? ' is-open' : ''}`}
                id="main-mobile-navigation"
              >
                {isAuthenticated ? (
                  <>
                    <div className="main-nav__links">
                      <NavLink
                        to="/"
                        className={navLinkClass}
                        onClick={closeMobileNav}
                      >
                        {t('common.home')}
                      </NavLink>

                      <NavLink
                        to="/dashboard"
                        className={navLinkClass}
                        onClick={closeMobileNav}
                      >
                        {t('common.dashboard')}
                      </NavLink>

                      {isCandidate && (
                        <>
                          <NavLink
                            to="/jobs"
                            className={navLinkClass}
                            onClick={closeMobileNav}
                          >
                            {t('common.findJobs')}
                          </NavLink>

                          <NavLink
                            to="/applications"
                            className={navLinkClass}
                            onClick={closeMobileNav}
                          >
                            {t('common.applications')}
                          </NavLink>
                        </>
                      )}

                      {isRecruiter && (
                        <>
                          <NavLink
                            to="/recruiter/company"
                            className={navLinkClass}
                            onClick={closeMobileNav}
                          >
                            {t('dashboard.recruiter.company')}
                          </NavLink>

                          <NavLink
                            to="/recruiter/jobs"
                            className={navLinkClass}
                            onClick={closeMobileNav}
                          >
                            {t('dashboard.recruiter.jobs')}
                          </NavLink>

                          <NavLink
                            to="/recruiter/applications"
                            className={navLinkClass}
                            onClick={closeMobileNav}
                          >
                            {t('common.applications')}
                          </NavLink>
                        </>
                      )}

                      <NavLink
                        to="/profile"
                        className={navLinkClass}
                        onClick={closeMobileNav}
                      >
                        {t('common.profile')}
                      </NavLink>
                    </div>

                    <div className="main-nav__actions">
                      {languageSwitcher}
                      {userActions}
                    </div>
                  </>
                ) : (
                  <div className="main-nav__links">
                    <NavLink
                      to="/"
                      className={navLinkClass}
                      onClick={closeMobileNav}
                    >
                      {t('common.home')}
                    </NavLink>

                    <NavLink
                      to="/login"
                      className={navLinkClass}
                      onClick={closeMobileNav}
                    >
                      {t('common.login')}
                    </NavLink>

                    <NavLink
                      to="/register"
                      className={navLinkClass}
                      onClick={closeMobileNav}
                    >
                      {t('common.register')}
                    </NavLink>

                    {languageSwitcher}
                  </div>
                )}
              </div>
            </nav>
          </header>

          <main id="main-content" className="app-content">
            <Outlet />
          </main>
        </div>
      )}
    </>
  )
}

export default Layout
