import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import type { DemoLoginRole } from '../types/auth'
import { useTranslation } from '../i18n/useTranslation'
import {
  getPublicContentPage,
  type PublicContentPage,
} from '../features/admin/content.api'
import { PublicCmsContent } from '../components/PublicCmsContent'
import './LandingPage.css'

function LandingPage() {
  const { t, language } = useTranslation()
  const { isAuthenticated, demoLogin } = useAuth()
  const navigate = useNavigate()

  const [loadingRole, setLoadingRole] = useState<DemoLoginRole | null>(null)
  const [demoLoginError, setDemoLoginError] = useState(false)
  const [cmsPage, setCmsPage] = useState<PublicContentPage | null>(null)

  useEffect(() => {
    let cancelled = false

    setCmsPage(null)

    getPublicContentPage('home', language)
      .then((page) => {
        if (!cancelled) {
          setCmsPage(page)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCmsPage(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [language])

  const handleDemoLogin = async (role: DemoLoginRole) => {
    setLoadingRole(role)
    setDemoLoginError(false)

    try {
      await demoLogin(role)
      navigate(role === 'CANDIDATE' ? '/jobs' : '/dashboard')
    } catch {
      setDemoLoginError(true)
    } finally {
      setLoadingRole(null)
    }
  }

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            {t('landing.eyebrow')}
          </span>

          <h1>
            {cmsPage?.publishedTitle ?? t('landing.title')}
          </h1>

          {!cmsPage && (
            <h2>{t('landing.subtitle')}</h2>
          )}

          <p className="landing-hero-description">
            {t('landing.description')}
          </p>

          <div className="landing-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-primary-button">
                {t('landing.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing-primary-button">
                  {t('landing.getStarted')} →
                </Link>

                <Link to="/login" className="landing-secondary-button">
                  {t('common.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {cmsPage && (
        <PublicCmsContent content={cmsPage.publishedContent} />
      )}

      <section className="landing-audience">
        <article className="landing-card">
          <span className="landing-card-label">
            {t('landing.candidates.label')}
          </span>

          <h2>{t('landing.candidates.title')}</h2>

          <p>{t('landing.candidates.description')}</p>

          {!isAuthenticated && (
            <>
              <Link to="/register">
                {t('landing.candidates.createAccount')} →
              </Link>

              <button
                type="button"
                className="landing-demo-button"
                disabled={loadingRole !== null}
                onClick={() => void handleDemoLogin('CANDIDATE')}
              >
                {loadingRole === 'CANDIDATE'
                  ? t('landing.demoLoading')
                  : t('landing.candidates.demoAccess')}
              </button>
            </>
          )}
        </article>

        <article className="landing-card">
          <span className="landing-card-label">
            {t('landing.recruiters.label')}
          </span>

          <h2>{t('landing.recruiters.title')}</h2>

          <p>{t('landing.recruiters.description')}</p>

          {!isAuthenticated && (
            <>
              <Link to="/register">
                {t('landing.recruiters.getStarted')} →
              </Link>

              <button
                type="button"
                className="landing-demo-button"
                disabled={loadingRole !== null}
                onClick={() => void handleDemoLogin('RECRUITER')}
              >
                {loadingRole === 'RECRUITER'
                  ? t('landing.demoLoading')
                  : t('landing.recruiters.demoAccess')}
              </button>
            </>
          )}
        </article>
      </section>

      {demoLoginError && (
        <p className="landing-demo-error" role="alert">
          {t('landing.demoLoginError')}
        </p>
      )}

      {loadingRole !== null && (
        <div
          className="demo-loading-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="demo-loading-panel">
            <div className="demo-loading-spinner" />

            <span className="demo-loading-eyebrow">
              IT TALENT PLATFORM
            </span>

            <h2>{t('landing.demoStartup.title')}</h2>

            <p className="demo-loading-description">
              {t('landing.demoStartup.description')}
            </p>

            <div className="demo-loading-services">
              {(['render', 'neon', 'github'] as const).map(
                (service) => (
                  <div className="demo-service" key={service}>
                    <span
                      className={`demo-service-indicator ${service === 'github' ? 'idle' : 'active'
                        }`}
                    />

                    <div>
                      <strong>
                        {t(`landing.demoStartup.${service}.name`)}
                      </strong>

                      <span>
                        {t(
                          `landing.demoStartup.${service}.description`,
                        )}
                      </span>
                    </div>

                    <span className="demo-service-status">
                      {t(`landing.demoStartup.${service}.status`)}
                    </span>
                  </div>
                ),
              )}
            </div>
            <div className="demo-loading-progress">
              <span />
            </div>
            <p className="demo-loading-role">
              {t('landing.demoStartup.account')}:{' '}
              {t(
                loadingRole === 'CANDIDATE'
                  ? 'landing.demoStartup.candidate'
                  : 'landing.demoStartup.recruiter',
              )}
            </p>
          </div>
        </div>
      )}

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} IT Talent</span>
      </footer>
    </div>
  )
}

export default LandingPage
