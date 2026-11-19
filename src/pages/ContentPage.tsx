
import { useEffect, useState } from 'react'
import { generateHTML } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import DOMPurify from 'dompurify'
import { useTranslation } from '../i18n/useTranslation'
import {
    getPublicContentPage,
    type ContentLocale,
    type PublicContentPage,
} from '../features/admin/content.api'
import './ContentPage.css'

interface ContentPageProps {
    slugs: Record<ContentLocale, string>
}

const contentExtensions = [
    StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        link: false,
        underline: false,
    }),
    Underline,
    Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
    }),
]

function ContentPage({ slugs }: ContentPageProps) {
    const { language, t } = useTranslation()
    const locale: ContentLocale = language === 'en' ? 'en' : 'nl'
    const slug = slugs[locale]

    const [page, setPage] = useState<PublicContentPage | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let isActive = true

        async function loadPage() {
            setIsLoading(true)
            setError(false)
            setPage(null)

            try {
                const result = await getPublicContentPage(slug, locale)

                if (isActive) {
                    setPage(result)
                }
            } catch {
                if (isActive) {
                    setError(true)
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
    }, [slug, locale])

    if (isLoading) {
        return (
            <main className="content-page">
                <div className="content-page__content">
                    <p role="status">
                        {t('contentPage.loading')}
                    </p>
                </div>
            </main>
        )
    }

    if (error || !page) {
        return (
            <main className="content-page">
                <div className="content-page__content">
                    <p role="alert">
                        {t('contentPage.unavailable')}
                    </p>
                </div>
            </main>
        )
    }

    const content = page.publishedContent as JSONContent

    const contentWithoutDuplicateTitle = {
        ...content,
        content: content.content?.filter((node, index) => {
            if (
                index === 0 &&
                node.type === 'heading' &&
                node.content
                    ?.map((item) => item.text ?? '')
                    .join('')
                    .trim() === page.publishedTitle.trim()
            ) {
                return false
            }

            return true
        }),
    }

    const html = generateHTML(
        contentWithoutDuplicateTitle,
        contentExtensions,
    )

    const sanitizedHtml = DOMPurify.sanitize(html)

    return (
        <main className="content-page">
            <div className="content-page__content">
                <h1>{page.publishedTitle}</h1>

                <div
                    className="content-page__rich-content"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            </div>
        </main>
    )
}

export default ContentPage
