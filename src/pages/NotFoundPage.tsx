
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import './NotFoundPage.css'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1>{t('errors.pageNotFound')}</h1>
        <p>{t('errors.pageNotFoundDescription')}</p>
        <Link to="/" className="btn btn-primary">
          {t('errors.backToHome')}
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
