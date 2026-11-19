import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog'
import {
    getContentPages,
    getContentPage,
    updateContentTranslation,
    publishContentTranslation,
    unpublishContentTranslation,
    deleteContentTranslation,
    deleteContentPage,
    type ContentLocale,
    type ContentPage,
} from '../content.api'
import CmsRichTextEditor from './CmsRichTextEditor'
import type { JSONContent } from '@tiptap/core'
import './AdminContentPage.css'
import ActionMenu from '../../../components/ActionMenu/ActionMenu'

const INITIAL_CONTENT: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
}

export default function AdminContentPage() {
    const { t, language } = useTranslation()
    const activeLocale: ContentLocale = language === 'en' ? 'en' : 'nl'

    const [pages, setPages] = useState<ContentPage[]>([])
    const [selectedPageId, setSelectedPageId] = useState('')
    const [locale, setLocale] = useState<ContentLocale>(activeLocale)
    const [tableLocale, setTableLocale] = useState<ContentLocale>(activeLocale)

    const [title, setTitle] = useState('')
    const [content, setContent] = useState<JSONContent>(INITIAL_CONTENT)

    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingEditor, setIsLoadingEditor] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeletingTranslation, setIsDeletingTranslation] = useState(false)

    const [pageToDelete, setPageToDelete] = useState<ContentPage | null>(null)
    const [confirmDeleteTranslation, setConfirmDeleteTranslation] =
        useState(false)

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const loadPages = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await getContentPages()
            setPages(data)
        } catch {
            setError(t('adminContent.loadError'))
        } finally {
            setIsLoading(false)
        }
    }, [t])

    useEffect(() => {
        void loadPages()
    }, [loadPages])

    useEffect(() => {
        setTableLocale(activeLocale)
    }, [activeLocale])

    const selectedPage = pages.find(
        (page) => page.id === selectedPageId,
    )

    const selectedTranslation = selectedPage?.translations.find(
        (item) => item.locale === locale,
    )

    const handleOpenEditor = async (page: ContentPage) => {
        setIsLoadingEditor(true)
        setError(null)
        setSuccess(null)

        try {
            const fullPage = await getContentPage(page.id)

            setPages((current) =>
                current.map((item) =>
                    item.id === fullPage.id ? fullPage : item,
                ),
            )

            const preferredLocale: ContentLocale =
                fullPage.translations.some(
                    (item) => item.locale === tableLocale,
                )
                    ? tableLocale
                    : fullPage.translations[0]?.locale ?? tableLocale

            const translation = fullPage.translations.find(
                (item) => item.locale === preferredLocale,
            )

            setTitle(translation?.draftTitle ?? '')
            setContent(
                (translation?.draftContent as JSONContent | null) ??
                (translation?.publishedContent as JSONContent | null) ??
                INITIAL_CONTENT,
            )

            setLocale(preferredLocale)
            setSelectedPageId(fullPage.id)
        } catch {
            setError(t('adminContent.loadError'))
        } finally {
            setIsLoadingEditor(false)
        }
    }

    const closeEditor = () => {
        if (
            isSaving ||
            isPublishing ||
            isDeletingTranslation ||
            isLoadingEditor
        ) return

        setSelectedPageId('')
        setTitle('')
        setContent(INITIAL_CONTENT)
        setError(null)
        setSuccess(null)
        setConfirmDeleteTranslation(false)
    }

    const updatePageTranslation = (
        updatedTranslation: ContentPage['translations'][number],
    ) => {
        setPages((current) =>
            current.map((page) => {
                if (page.id !== selectedPageId) return page

                return {
                    ...page,
                    translations: [
                        ...page.translations.filter(
                            (item) => item.locale !== locale,
                        ),
                        updatedTranslation,
                    ],
                }
            }),
        )
    }

    const handleSave = async () => {
        if (!selectedPageId) return

        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const updatedTranslation = await updateContentTranslation(
                selectedPageId,
                locale,
                {
                    draftTitle: title.trim(),
                    draftContent: content,
                },
            )

            updatePageTranslation(updatedTranslation)
            setSuccess(t('adminContent.saveSuccess'))
        } catch {
            setError(t('adminContent.updateError'))
        } finally {
            setIsSaving(false)
        }
    }

    const handlePublish = async () => {
        if (!selectedPageId || !title.trim() || !selectedTranslation) return

        setIsPublishing(true)
        setError(null)
        setSuccess(null)

        try {
            const savedTranslation = await updateContentTranslation(
                selectedPageId,
                locale,
                {
                    draftTitle: title.trim(),
                    draftContent: content,
                },
            )

            updatePageTranslation(savedTranslation)

            const publishedTranslation = await publishContentTranslation(
                selectedPageId,
                locale,
            )

            updatePageTranslation(publishedTranslation)
            setSuccess(t('adminContent.publishSuccess'))
        } catch {
            setError(t('adminContent.publishError'))
        } finally {
            setIsPublishing(false)
        }
    }

    const handleUnpublish = async () => {
        if (!selectedPageId || !selectedTranslation) return

        setIsPublishing(true)
        setError(null)
        setSuccess(null)

        try {
            const updatedTranslation = await unpublishContentTranslation(
                selectedPageId,
                locale,
            )

            updatePageTranslation(updatedTranslation)
            setSuccess(t('adminContent.unpublishSuccess'))
        } catch {
            setError(t('adminContent.unpublishError'))
        } finally {
            setIsPublishing(false)
        }
    }

    const handleDeletePage = async () => {
        if (!pageToDelete) return

        setIsDeleting(true)
        setError(null)
        setSuccess(null)

        try {
            await deleteContentPage(pageToDelete.id)

            setPages((current) =>
                current.filter((page) => page.id !== pageToDelete.id),
            )

            if (selectedPageId === pageToDelete.id) {
                closeEditor()
            }

            setPageToDelete(null)
        } catch {
            setError(t('adminContent.deleteError'))
            setPageToDelete(null)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteTranslation = async () => {
        if (!selectedPageId || !selectedTranslation) return

        setIsDeletingTranslation(true)
        setError(null)
        setSuccess(null)

        try {
            await deleteContentTranslation(selectedPageId, locale)

            setPages((current) =>
                current.map((page) => {
                    if (page.id !== selectedPageId) return page

                    return {
                        ...page,
                        translations: page.translations.filter(
                            (item) => item.locale !== locale,
                        ),
                    }
                }),
            )

            setTitle('')
            setContent(INITIAL_CONTENT)
            setConfirmDeleteTranslation(false)
        } catch {
            setError(t('adminContent.deleteError'))
            setConfirmDeleteTranslation(false)
        } finally {
            setIsDeletingTranslation(false)
        }
    }

    if (isLoading) {
        return (
            <div
                className="admin-content-page admin-content-loading"
                role="status"
                aria-live="polite"
            >
                <p>{t('adminContent.loading')}</p>
            </div>
        )
    }

    return (
        <div className="admin-content-page">
            <h1>{t('adminContent.title')}</h1>
            <p>{t('adminContent.description')}</p>

            {error && !selectedPage && (
                <p
                    className="admin-content-message admin-content-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {success && !selectedPage && (
                <p
                    className="admin-content-message admin-content-success"
                    role="status"
                >
                    {success}
                </p>
            )}

            {!selectedPageId && (
                <section className="admin-content-section admin-content-overview">
                    <div className="admin-content-section-header">
                        <h2>{t('adminContent.existingPages')}</h2>

                        <Link
                            to="/admin/content/new"
                            className="btn btn-primary"
                        >
                            {t('adminContent.newPage')}
                        </Link>
                    </div>

                    {pages.length === 0 ? (
                        <p>{t('adminContent.noPages')}</p>
                    ) : (
                        <div className="admin-content-table-wrapper">
                            <table className="admin-content-table">
                                <thead>
                                    <tr>
                                        <th>{t('common.page')}</th>
                                        <th>{t('common.translations')}</th>
                                        <th>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page) => {
                                        const activeTranslation =
                                            page.translations.find(
                                                (item) => item.locale === tableLocale,
                                            )

                                        const fallbackTranslation =
                                            page.translations[0]

                                        const displayedTranslation =
                                            activeTranslation ?? fallbackTranslation

                                        const displayedTitle =
                                            displayedTranslation?.draftTitle ||
                                            displayedTranslation?.publishedTitle ||
                                            '—'

                                        const otherTranslations =
                                            page.translations.filter(
                                                (item) => item.locale !== tableLocale,
                                            )

                                        return (
                                            <tr key={page.id}>
                                                <td className="admin-content-page-title-cell">
                                                    <span>{displayedTitle}</span>
                                                    {!activeTranslation && displayedTranslation && (
                                                        <span className="admin-content-fallback-locale">
                                                            {displayedTranslation.locale.toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="admin-content-translation-list">
                                                        {otherTranslations.length > 0 ? (
                                                            otherTranslations.map((translation) => (
                                                                <button
                                                                    key={translation.id}
                                                                    type="button"
                                                                    className="admin-content-translation-badge"
                                                                    onClick={() =>
                                                                        setTableLocale(translation.locale)
                                                                    }
                                                                    aria-label={`Show pages in ${translation.locale.toUpperCase()}`}
                                                                    aria-pressed={false}
                                                                >
                                                                    {translation.locale.toUpperCase()}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <span className="admin-content-no-translations">
                                                                —
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="admin-content-actions-cell">
                                                    <ActionMenu
                                                        ariaLabel={`${t('common.actions')} - ${displayedTitle || page.id}`}
                                                        actions={[
                                                            {
                                                                label: t('adminContent.preview'),
                                                                onClick: () => {
                                                                    const previewLocale =
                                                                        displayedTranslation?.locale ?? tableLocale
                                                                    const previewUrl =
                                                                        `/admin/content/${page.id}/preview?locale=${previewLocale}`

                                                                    window.open(
                                                                        previewUrl,
                                                                        '_blank',
                                                                        'noopener,noreferrer',
                                                                    )
                                                                },
                                                                disabled: !displayedTranslation || isLoadingEditor,
                                                            },
                                                            {
                                                                label: t('common.edit'),
                                                                onClick: () => void handleOpenEditor(page),
                                                                disabled:
                                                                    isLoadingEditor ||
                                                                    isSaving ||
                                                                    isPublishing,
                                                            },
                                                            {
                                                                label: t('common.delete'),
                                                                onClick: () => setPageToDelete(page),
                                                                destructive: true,
                                                                disabled: isDeleting,
                                                            },
                                                        ]}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {isLoadingEditor && (
                <p role="status" aria-live="polite">
                    {t('adminContent.loading')}
                </p>
            )}

            {selectedPage && (
                <section className="admin-content-section admin-content-editor-section">
                    <div className="admin-content-section-header">
                        <h2>
                            {t('adminContent.editPage')}: {selectedTranslation?.draftTitle || selectedTranslation?.publishedTitle || 'Untitled page'}
                        </h2>
                    </div>

                    {error && (
                        <p
                            className="admin-content-message admin-content-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            className="admin-content-message admin-content-success"
                            role="status"
                        >
                            {success}
                        </p>
                    )}

                    <form
                        className="admin-content-drawer-form"
                        onSubmit={(event) => {
                            event.preventDefault()
                            void handleSave()
                        }}
                    >
                        <div className="admin-content-actions">
                            {selectedTranslation?.isPublished ? (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => void handleUnpublish()}
                                    disabled={isPublishing || isSaving}
                                >
                                    {isPublishing
                                        ? t('adminContent.unpublishing')
                                        : t('adminContent.unpublish')}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => void handlePublish()}
                                    disabled={
                                        isPublishing ||
                                        isSaving ||
                                        !title.trim() ||
                                        !selectedTranslation
                                    }
                                >
                                    {isPublishing
                                        ? t('adminContent.publishing')
                                        : t('adminContent.publish')}
                                </button>
                            )}
                        </div>

                        <div className="admin-content-field">
                            <label htmlFor="content-locale">
                                {t('adminContent.selectLocale')}
                            </label>

                            <select
                                id="content-locale"
                                value={locale}
                                onChange={(event) => {
                                    const nextLocale = event.target.value as ContentLocale

                                    const translation = selectedPage?.translations.find(
                                        (item) => item.locale === nextLocale,
                                    )

                                    setTitle(translation?.draftTitle ?? '')
                                    setContent(
                                        (translation?.draftContent as JSONContent | null) ??
                                        (translation?.publishedContent as JSONContent | null) ??
                                        INITIAL_CONTENT,
                                    )

                                    setLocale(nextLocale)
                                }}
                                disabled={isSaving || isPublishing}
                            >
                                <option value="nl">
                                    {t('adminContent.dutch')}
                                </option>
                                <option value="en">
                                    {t('adminContent.english')}
                                </option>
                            </select>
                        </div>

                        <div className="admin-content-field">
                            <label htmlFor="content-title">
                                {t('adminContent.titleLabel')}
                            </label>

                            <input
                                id="content-title"
                                type="text"
                                maxLength={200}
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                disabled={isSaving || isPublishing}
                            />
                        </div>

                        <div className="admin-content-field admin-content-rich-editor">
                            <CmsRichTextEditor
                                key={`${selectedPage.id}-${locale}`}
                                value={content}
                                onChange={setContent}
                                disabled={isSaving || isPublishing}
                            />
                        </div>

                        <div className="admin-content-actions">
                            {selectedTranslation &&
                                selectedPage.translations.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setConfirmDeleteTranslation(true)
                                        }
                                        disabled={
                                            isDeletingTranslation ||
                                            isSaving ||
                                            isPublishing
                                        }
                                    >
                                        {t('adminContent.deleteTranslation')}
                                    </button>
                                )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSaving || isPublishing}
                            >
                                {isSaving
                                    ? t('adminContent.saving')
                                    : t('adminContent.save')}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeEditor}
                                disabled={
                                    isSaving ||
                                    isPublishing ||
                                    isDeletingTranslation
                                }
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <ConfirmDialog
                open={pageToDelete !== null}
                title={t('common.delete')}
                message={
                    pageToDelete
                        ? `${t('adminContent.deleteConfirmation')} ${pageToDelete.translations
                            .map(
                                (translation) =>
                                    `${translation.locale}: ${translation.slug}`,
                            )
                            .join(', ')}`
                        : ''
                }
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                onConfirm={() => void handleDeletePage()}
                onCancel={() => setPageToDelete(null)}
                destructive
            />

            <ConfirmDialog
                open={confirmDeleteTranslation}
                title={t('adminContent.deleteTranslation')}
                message={t('adminContent.deleteTranslationConfirmation')}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                onConfirm={() => void handleDeleteTranslation()}
                onCancel={() => setConfirmDeleteTranslation(false)}
                destructive
            />
        </div>
    )
}
