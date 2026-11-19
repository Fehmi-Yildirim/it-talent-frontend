import { render, screen, } from '../test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContentPage from '../../src/pages/ContentPage'
import { getPublicContentPage } from '../../src/features/admin/content.api'
import type {
    ContentLocale,
    PublicContentPage,
} from '../../src/features/admin/content.api'

const { mockLanguage } = vi.hoisted(() => ({
    mockLanguage: {
        value: 'en' as ContentLocale,
    },
}))

vi.mock('../../src/features/admin/content.api', () => ({
    getPublicContentPage: vi.fn(),
}))

vi.mock('../../src/i18n/useTranslation', () => ({
    useTranslation: () => ({
        language: mockLanguage.value,
        t: (key: string) => {
            const translations: Record<string, string> = {
                'contentPage.loading': 'Loading page...',
                'contentPage.unavailable': 'This page is currently unavailable.',
            }

            return translations[key] ?? key
        },
    }),
}))

const mockedGetPublicContentPage = vi.mocked(getPublicContentPage)

const englishPage: PublicContentPage = {
    locale: 'en',
    publishedTitle: 'About this app',
    publishedContent: {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'About this app' }],
            },
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'Welcome to IT Talent.' },
                ],
            },
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Our mission' }],
            },
            {
                type: 'paragraph',
                content: [
                    {
                        type: 'text',
                        text: 'Connecting talent with opportunities.',
                    },
                ],
            },
            {
                type: 'bulletList',
                content: [
                    {
                        type: 'listItem',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    { type: 'text', text: 'Find opportunities' },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: 'paragraph',
                content: [
                    {
                        type: 'text',
                        text: 'Visit our website',
                        marks: [
                            {
                                type: 'link',
                                attrs: { href: 'https://example.com' },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    publishedAt: '2026-01-01T10:00:00.000Z',
}

const dutchPage: PublicContentPage = {
    locale: 'nl',
    publishedTitle: 'Over deze app',
    publishedContent: {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Over deze app' }],
            },
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'Welkom bij IT Talent.' },
                ],
            },
        ],
    },
    publishedAt: '2026-01-01T10:00:00.000Z',
}

function renderContentPage() {
    return render(
        <ContentPage
            slugs={{
                en: 'about-this-app',
                nl: 'over-deze-app',
            }}
        />,
    )
}

describe('ContentPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLanguage.value = 'en'
    })

    it('shows the loading state while fetching content', () => {
        mockedGetPublicContentPage.mockReturnValue(
            new Promise(() => { }),
        )

        renderContentPage()

        expect(screen.getByRole('status')).toHaveTextContent(
            'Loading page...',
        )
    })

    it('loads and renders the English content', async () => {
        mockedGetPublicContentPage.mockResolvedValue(englishPage)

        renderContentPage()

        expect(
            await screen.findByRole('heading', {
                level: 1,
                name: 'About this app',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Welcome to IT Talent.'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('heading', {
                level: 2,
                name: 'Our mission',
            }),
        ).toBeInTheDocument()

        expect(mockedGetPublicContentPage).toHaveBeenCalledWith(
            'about-this-app',
            'en',
        )
    })

    it('loads and renders the Dutch content', async () => {
        mockLanguage.value = 'nl'
        mockedGetPublicContentPage.mockResolvedValue(dutchPage)

        renderContentPage()

        expect(
            await screen.findByRole('heading', {
                level: 1,
                name: 'Over deze app',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Welkom bij IT Talent.'),
        ).toBeInTheDocument()

        expect(mockedGetPublicContentPage).toHaveBeenCalledWith(
            'over-deze-app',
            'nl',
        )
    })

    it('does not render the duplicate title inside the rich content', async () => {
        mockedGetPublicContentPage.mockResolvedValue(englishPage)

        renderContentPage()

        await screen.findByText('Welcome to IT Talent.')

        expect(
            screen.getAllByRole('heading', {
                name: 'About this app',
            }),
        ).toHaveLength(1)
    })

    it('renders rich text formatting and links', async () => {
        mockedGetPublicContentPage.mockResolvedValue(englishPage)

        renderContentPage()

        await screen.findByText('Welcome to IT Talent.')

        expect(
            screen.getByRole('list'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Find opportunities'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('link', {
                name: 'Visit our website',
            }),
        ).toHaveAttribute('href', 'https://example.com')
    })

    it('shows an error message when the API request fails', async () => {
        mockedGetPublicContentPage.mockRejectedValue(
            new Error('API request failed'),
        )

        renderContentPage()

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'This page is currently unavailable.',
        )
    })

    it('shows an error message when no page is returned', async () => {
        mockedGetPublicContentPage.mockResolvedValue(
            null as unknown as PublicContentPage,
        )

        renderContentPage()

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'This page is currently unavailable.',
        )
    })


    it('removes unsafe link protocols from CMS content', async () => {
        const unsafePage: PublicContentPage = {
            ...englishPage,
            publishedContent: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'Unsafe link',
                                marks: [
                                    {
                                        type: 'link',
                                        attrs: {
                                            href: 'javascript:alert(1)',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        }

        mockedGetPublicContentPage.mockResolvedValue(unsafePage)

        const { container } = renderContentPage()

        expect(await screen.findByText('Unsafe link')).toBeInTheDocument()

        const link = container.querySelector('a')

        expect(link).not.toHaveAttribute('href', 'javascript:alert(1)')
        expect(container.querySelector('[onerror]')).not.toBeInTheDocument()
    })

})
