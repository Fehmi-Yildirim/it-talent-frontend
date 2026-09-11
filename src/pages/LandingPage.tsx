import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useTranslation } from '../i18n/useTranslation'
import './LandingPage.css'

function LandingPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            {t('landing.eyebrow')}
          </span>

          <h1>{t('landing.title')}</h1>

          <h2>{t('landing.subtitle')}</h2>

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
                  {t('landing.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="landing-audience">
        <article className="landing-card">
          <span className="landing-card-label">
            {t('landing.candidates.label')}
          </span>

          <h2>{t('landing.candidates.title')}</h2>

          <p>{t('landing.candidates.description')}</p>

          {!isAuthenticated && (
            <Link to="/register">
              {t('landing.candidates.createAccount')} →
            </Link>
          )}
        </article>

        <article className="landing-card">
          <span className="landing-card-label">
            {t('landing.recruiters.label')}
          </span>

          <h2>{t('landing.recruiters.title')}</h2>

          <p>{t('landing.recruiters.description')}</p>

          {!isAuthenticated && (
            <Link to="/register">
              {t('landing.recruiters.getStarted')} →
            </Link>
          )}
        </article>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} IT Talent</span>
      </footer>
    </div>
  )
}

export default LandingPage