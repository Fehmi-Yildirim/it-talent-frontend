import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { ApiError } from '../../../services/api/apiError'
import {
    createContentPage,
    getContentPage,
    type ContentLocale,
} from '../content.api'
import './AdminContentPage.css'

export default function AdminContentNewPage() {
    const { t, language } = useTranslation()
    const navigate = useNavigate()

    const activeLocale: ContentLocale = language === 'en' ? 'en' : 'nl'

    const [newPageTitle, setNewPageTitle] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedTitle = newPageTitle.trim()

        if (!normalizedTitle) return

        setIsCreating(true)
        setError(null)

        try {
            const created = await createContentPage({
                title: normalizedTitle,
                locale: activeLocale,
            })

            // Fetch the complete page before returning to the overview.
            await getContentPage(created.id)

            navigate('/admin/content')
        } catch (requestError) {
            if (
                requestError instanceof ApiError &&
                requestError.status === 409
            ) {
                setError(t('adminContent.duplicateSlug'))
            } else {
                setError(t('adminContent.createError'))
            }
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="admin-content-page">
            <h1>{t('adminContent.newPage')}</h1>
            <p>{t('adminContent.description')}</p>

            {error && (
                <p
                    className="admin-content-message admin-content-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            <section className="admin-content-section admin-content-create">
                <h2>{t('adminContent.newPage')}</h2>

                <form onSubmit={(event) => void handleCreate(event)}>
                    <div className="admin-content-field">
                        <label htmlFor="content-page-title">
                            {t('adminContent.titleLabel')}
                        </label>

                        <input
                            id="content-page-title"
                            type="text"
                            value={newPageTitle}
                            onChange={(event) =>
                                setNewPageTitle(event.target.value)
                            }
                            maxLength={200}
                            required
                            disabled={isCreating}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isCreating || !newPageTitle.trim()}
                    >
                        {isCreating
                            ? t('adminContent.creating')
                            : t('adminContent.createPage')}
                    </button>
                </form>
            </section>
        </div>
    )
}
