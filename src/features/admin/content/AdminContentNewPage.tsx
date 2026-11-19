
import { useState, type FormEvent } from 'react'
import type { JSONContent } from '@tiptap/core'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { ApiError } from '../../../services/api/apiError'
import CmsRichTextEditor from './CmsRichTextEditor'
import {
    createContentPage,
    type ContentLocale,
} from '../content.api'
import './AdminContentPage.css'

const INITIAL_CONTENT: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
}

function hasMeaningfulContent(content: JSONContent): boolean {
    if (content.text?.trim()) {
        return true
    }

    return content.content?.some(hasMeaningfulContent) ?? false
}

export default function AdminContentNewPage() {
    const { t, language } = useTranslation()
    const navigate = useNavigate()

    const [locale, setLocale] = useState<ContentLocale>(
        language === 'en' ? 'en' : 'nl',
    )
    const [title, setTitle] = useState('')
    const [content, setContent] = useState<JSONContent>(INITIAL_CONTENT)
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedTitle = title.trim()

        if (!normalizedTitle || !hasMeaningfulContent(content)) {
            return
        }

        setIsCreating(true)
        setError(null)

        try {
            await createContentPage({
                title: normalizedTitle,
                locale,
                draftContent: content as Record<string, unknown>,
            })

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

    const handleCancel = () => {
        navigate('/admin/content')
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


                <form onSubmit={(event) => void handleCreate(event)}>
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
                            disabled={isCreating}
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
                        <label htmlFor="content-page-title">
                            {t('adminContent.titleLabel')}
                        </label>

                        <input
                            id="content-page-title"
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            maxLength={200}
                            required
                            disabled={isCreating}
                            autoFocus
                        />
                    </div>

                    <div className="admin-content-field admin-content-rich-editor">
                        <CmsRichTextEditor
                            value={content}
                            onChange={setContent}
                            disabled={isCreating}
                        />
                    </div>

                    <div className="admin-content-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                isCreating ||
                                !title.trim() ||
                                !hasMeaningfulContent(content)
                            }
                        >
                            {isCreating
                                ? t('adminContent.creating')
                                : t('adminContent.createPage')}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                            disabled={isCreating}
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}
