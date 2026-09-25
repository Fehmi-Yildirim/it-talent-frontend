import { useTranslation } from '../i18n/useTranslation'
import './NotFoundPage.css'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="not-found-page">
      <h1>{t('errors.pageNotFound')}</h1>
    </div>
  )
}

export default NotFoundPage