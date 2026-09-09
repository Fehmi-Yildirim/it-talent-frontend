import { useTranslation } from '../i18n/context'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main>
      <h1>{t('errors.pageNotFound')}</h1>
    </main>
  )
}

export default NotFoundPage