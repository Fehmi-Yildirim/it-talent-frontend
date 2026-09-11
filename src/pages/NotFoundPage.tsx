import { useTranslation } from '../i18n/useTranslation'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main>
      <h1>{t('errors.pageNotFound')}</h1>
    </main>
  )
}

export default NotFoundPage