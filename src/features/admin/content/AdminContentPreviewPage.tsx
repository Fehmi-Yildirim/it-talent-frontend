import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { PublicCmsContent } from '../../../components/PublicCmsContent'
import { useTranslation } from '../../../i18n/useTranslation'
import {
    getContentPage,
    type ContentLocale,
    type ContentPage,
    type ContentTranslation,
} from '../content.api'
import './AdminContentPreviewPage.css'

const EMPTY_CONTENT: Record<string, unknown> = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
}

function isContentLocale(value: string | null): value is ContentLocale {
    return value === 'nl' || value === 'en'
}

function getPreviewContent(translation: ContentTranslation) {
    return translation.draftContent ?? translation.publishedContent ?? EMPTY_CONTENT
}

function getPreviewTitle(translation: ContentTranslation) {
    return translation.draftTitle?.trim() ||
        translation.publishedTitle ||
        'Untitled page'
}

export default function AdminContentPreviewPage() {
    const { pageId } = useParams<{ pageId: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const { t } = useTranslation()

    const requestedLocale = searchParams.get('locale')

    const [page, setPage] = useState<ContentPage | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        let isActive = true

        async function loadPage() {
            if (!pageId) {
                setHasError(true)
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setHasError(false)

            try {
                const result = await getContentPage(pageId)

                if (isActive) {
                    setPage(result)
                }
            } catch {
                if (isActive) {
                    setHasError(true)
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        void loadPage()

        return () => {
            isActive = false
        }
    }, [pageId])

    const translations = page?.translations ?? []
    const selectedLocale = isContentLocale(requestedLocale)
        ? requestedLocale
        : translations[0]?.locale

    const selectedTranslation = translations.find(
        (translation) => translation.locale === selectedLocale,
    )

    const handleLocaleChange = (locale: ContentLocale) => {
        setSearchParams({ locale })
    }

    if (isLoading) {
        return (
            <main className="admin-content-preview">
                <p role="status">{t('adminContent.previewLoading')}</p>
            </main>
        )
    }

    if (hasError || !page) {
        return (
            <main className="admin-content-preview">
                <p role="alert">{t('adminContent.previewError')}</p>
            </main>
        )
    }

    if (!selectedTranslation) {
        return (
            <main className="admin-content-preview">
                <p role="status">{t('adminContent.previewNotFound')}</p>
            </main>
        )
    }

    const hasDraft = Boolean(
        selectedTranslation.draftTitle || selectedTranslation.draftContent,
    )

    return (
        <main className="admin-content-preview">
            <header className="admin-content-preview__header">
                <div>
                    <p className="admin-content-preview__eyebrow">
                        {t('adminContent.previewTitle')}
                    </p>
                    <h1>{getPreviewTitle(selectedTranslation)}</h1>
                    <span className="admin-content-preview__status">
                        {hasDraft
                            ? t('adminContent.previewDraft')
                            : t('adminContent.published')}
                    </span>
                </div>

                {translations.length > 1 && (
                    <div className="admin-content-preview__locale">
                        <label htmlFor="preview-locale">
                            {t('adminContent.selectLocale')}
                        </label>
                        <select
                            id="preview-locale"
                            value={selectedLocale}
                            onChange={(event) =>
                                handleLocaleChange(event.target.value as ContentLocale)
                            }
                        >
                            {translations.map((translation) => (
                                <option
                                    key={translation.id}
                                    value={translation.locale}
                                >
                                    {translation.locale.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </header>

            <article className="admin-content-preview__body">
                <PublicCmsContent content={getPreviewContent(selectedTranslation)} />
            </article>
        </main>
    )
}
