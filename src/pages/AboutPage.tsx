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
import './AboutPage.css'

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

function AboutPage() {
    const { language } = useTranslation()
    const locale: ContentLocale = language === 'en' ? 'en' : 'nl'

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
                const result = await getPublicContentPage('about', locale)

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
    }, [locale])

    if (isLoading) {
        return (
            <main className="about-page">
                <div className="about-page__content">
                    <p role="status">
                        {locale === 'nl'
                            ? 'Pagina laden...'
                            : 'Loading page...'}
                    </p>
                </div>
            </main>
        )
    }

    if (error || !page) {
        return (
            <main className="about-page">
                <div className="about-page__content">
                    <p role="alert">
                        {locale === 'nl'
                            ? 'Deze pagina is momenteel niet beschikbaar.'
                            : 'This page is currently unavailable.'}
                    </p>
                </div>
            </main>
        )
    }

    const html = generateHTML(
        page.publishedContent as JSONContent,
        contentExtensions,
    )

    const sanitizedHtml = DOMPurify.sanitize(html)

    return (
        <main className="about-page">
            <div className="about-page__content">
                <h1>{page.publishedTitle}</h1>

                <div
                    className="about-page__rich-content"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            </div>
        </main>
    )
}

export default AboutPage
