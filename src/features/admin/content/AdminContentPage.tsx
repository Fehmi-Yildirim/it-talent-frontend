import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { ApiError } from '../../../services/api/apiError'
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog'
import {
    createContentPage,
    getContentPage,
    getContentPages,
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

const INITIAL_CONTENT: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
}

export default function AdminContentPage() {
    const { t } = useTranslation()

    const [pages, setPages] = useState<ContentPage[]>([])
    const [selectedPageId, setSelectedPageId] = useState('')
    const [locale, setLocale] = useState<ContentLocale>('nl')

    const [title, setTitle] = useState('')
    const [introduction, setIntroduction] = useState('')
    const [content, setContent] = useState<JSONContent>(INITIAL_CONTENT)

    const [slug, setSlug] = useState('')

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
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

    const selectedPage = pages.find(
        (page) => page.id === selectedPageId,
    )

    const selectedTranslation = selectedPage?.translations.find(
        (item) => item.locale === locale,
    )

    const loadTranslation = useCallback(
        (page: ContentPage | undefined, selectedLocale: ContentLocale) => {
            const translation = page?.translations.find(
                (item) => item.locale === selectedLocale,
            )

            setTitle(translation?.draftTitle ?? '')
            setIntroduction(translation?.draftIntroduction ?? '')
            setContent(
                (translation?.draftContent as JSONContent | null) ??
                INITIAL_CONTENT,
            )
        },
        [],
    )

    useEffect(() => {
        loadTranslation(selectedPage, locale)
    }, [selectedPage, locale, loadTranslation])

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

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedSlug = slug.trim().toLowerCase()

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
            setError(t('adminContent.invalidSlug'))
            return
        }

        setIsCreating(true)
        setError(null)
        setSuccess(null)

        try {
            const created = await createContentPage({
                slug: normalizedSlug,
            })

            const refreshedPage = await getContentPage(created.id)

            setPages((current) => [...current, refreshedPage])
            setSelectedPageId(refreshedPage.id)
            setLocale('nl')
            setSlug('')
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
                    draftIntroduction: introduction.trim(),
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
                    draftIntroduction: introduction.trim(),
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
                setSelectedPageId('')
                setTitle('')
                setIntroduction('')
                setContent(INITIAL_CONTENT)
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
            setIntroduction('')
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
            <div className="admin-skills-header">
                <Link to="/dashboard" className="back-link">
                    {t('common.backToDashboard')}
                </Link>
            </div>

            <h1>{t('adminContent.title')}</h1>
            <p>{t('adminContent.description')}</p>

            {error && (
                <p className="admin-content-message admin-content-error" role="alert">
                    {error}
                </p>
            )}

            {success && (
                <p className="admin-content-message admin-content-success" role="status">
                    {success}
                </p>
            )}

            <section className="admin-content-section admin-content-create">
                <h2>{t('adminContent.newPage')}</h2>

                <form onSubmit={(event) => void handleCreate(event)}>
                    <div className="admin-content-field">
                        <label htmlFor="content-slug">
                            {t('adminContent.slug')}
                        </label>

                        <input
                            id="content-slug"
                            type="text"
                            value={slug}
                            onChange={(event) => setSlug(event.target.value)}
                            placeholder={t('adminContent.slugPlaceholder')}
                            maxLength={100}
                            required
                            disabled={isCreating}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isCreating || !slug.trim()}
                    >
                        {isCreating
                            ? t('adminContent.creating')
                            : t('adminContent.createPage')}
                    </button>
                </form>
            </section>

            <section className="admin-content-section admin-content-overview">
                <h2>{t('adminContent.existingPages')}</h2>

                {pages.length === 0 ? (
                    <p>{t('adminContent.noPages')}</p>
                ) : (
                    <div className="admin-skills-table-wrapper">
                        <table className="admin-skills-table">
                            <thead>
                                <tr>
                                    <th>{t('adminContent.slug')}</th>
                                    <th>{t('adminContent.dutch')}</th>
                                    <th>{t('adminContent.english')}</th>
                                    <th>{t('common.actions')}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pages.map((page) => {
                                    const nl = page.translations.find(
                                        (item) => item.locale === 'nl',
                                    )
                                    const en = page.translations.find(
                                        (item) => item.locale === 'en',
                                    )

                                    return (
                                        <tr key={page.id}>
                                            <td>{page.slug}</td>

                                            <td>
                                                {nl?.isPublished
                                                    ? t('adminContent.published')
                                                    : nl
                                                        ? t('adminContent.draft')
                                                        : t('adminContent.notCreated')}
                                            </td>

                                            <td>
                                                {en?.isPublished
                                                    ? t('adminContent.published')
                                                    : en
                                                        ? t('adminContent.draft')
                                                        : t('adminContent.notCreated')}
                                            </td>

                                            <td>
                                                <div className="admin-content-table-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setSelectedPageId(page.id)
                                                            setError(null)
                                                            setSuccess(null)
                                                        }}
                                                    >
                                                        {t('common.edit')}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => setPageToDelete(page)}
                                                        disabled={isDeleting}
                                                    >
                                                        {t('common.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedPage && (
                <section className="admin-content-section admin-content-editor-section">
                    <h2>
                        {t('adminContent.editPage')}: {selectedPage.slug}
                    </h2>

                    <div className="admin-content-field">
                        <label htmlFor="content-locale">
                            {t('adminContent.selectLocale')}
                        </label>

                        <select
                            id="content-locale"
                            value={locale}
                            onChange={(event) =>
                                setLocale(event.target.value as ContentLocale)
                            }
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
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={isSaving || isPublishing}
                        />
                    </div>

                    <div className="admin-content-field">
                        <label htmlFor="content-introduction">
                            {t('adminContent.introduction')}
                        </label>

                        <textarea
                            id="content-introduction"
                            maxLength={500}
                            value={introduction}
                            onChange={(event) =>
                                setIntroduction(event.target.value)
                            }
                            disabled={isSaving || isPublishing}
                        />
                    </div>

                    <div className="admin-content-field admin-content-rich-editor">
                        <h3>{t('adminContent.content')}</h3>

                        <CmsRichTextEditor
                            value={content}
                            onChange={setContent}
                            disabled={isSaving || isPublishing}
                        />
                    </div>

                    <div className="admin-content-actions">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => void handleSave()}
                            disabled={isSaving || isPublishing}
                        >
                            {isSaving
                                ? t('adminContent.saving')
                                : t('adminContent.save')}
                        </button>

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

                        {selectedTranslation && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setConfirmDeleteTranslation(true)}
                                disabled={
                                    isDeletingTranslation ||
                                    isSaving ||
                                    isPublishing
                                }
                            >
                                {t('adminContent.deleteTranslation')}
                            </button>
                        )}
                    </div>
                </section>
            )}

            <ConfirmDialog
                open={pageToDelete !== null}
                title={t('common.delete')}
                message={
                    pageToDelete
                        ? `${t('adminContent.deleteConfirmation')} ${pageToDelete.slug}`
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
