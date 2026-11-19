import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, within } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type { JSONContent } from '@tiptap/core'
import AdminContentPage from '../../src/features/admin/content/AdminContentPage'
import {
    getContentPages,
    getContentPage,
    updateContentTranslation,
    publishContentTranslation,
    unpublishContentTranslation,
    deleteContentTranslation,
    deleteContentPage,
    type ContentPage,
    type ContentTranslation,
} from '../../src/features/admin/content.api'

vi.mock('../../src/features/admin/content.api', () => ({
    getContentPages: vi.fn(),
    getContentPage: vi.fn(),
    updateContentTranslation: vi.fn(),
    publishContentTranslation: vi.fn(),
    unpublishContentTranslation: vi.fn(),
    deleteContentTranslation: vi.fn(),
    deleteContentPage: vi.fn(),
}))

vi.mock('../../src/components/ActionMenu/ActionMenu', () => ({
    default: ({
        actions,
        ariaLabel,
    }: {
        actions: {
            label: string
            onClick: () => void
            disabled?: boolean
        }[]
        ariaLabel: string
    }) => (
        <div aria-label={ariaLabel}>
            {actions.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                >
                    {action.label}
                </button>
            ))}
        </div>
    ),
}))

vi.mock('../../src/components/ConfirmDialog/ConfirmDialog', () => ({
    default: ({
        open,
        title,
        message,
        confirmLabel,
        cancelLabel,
        onConfirm,
        onCancel,
    }: {
        open: boolean
        title: string
        message: string
        confirmLabel: string
        cancelLabel: string
        onConfirm: () => void
        onCancel: () => void
    }) =>
        open ? (
            <div role="dialog" aria-label={title}>
                <p>{message}</p>
                <button type="button" onClick={onConfirm}>
                    {confirmLabel}
                </button>
                <button type="button" onClick={onCancel}>
                    {cancelLabel}
                </button>
            </div>
        ) : null,
}))

vi.mock('../../src/features/admin/content/CmsRichTextEditor', () => ({
    default: ({
        value,
        onChange,
        disabled,
    }: {
        value: JSONContent
        onChange: (value: JSONContent) => void
        disabled?: boolean
    }) => (
        <div>
            <label htmlFor="mock-rich-text-editor">Content</label>
            <textarea
                id="mock-rich-text-editor"
                aria-label="Content"
                value={value.content?.[0]?.content?.[0]?.text ?? ''}
                disabled={disabled}
                onChange={(event) =>
                    onChange({
                        type: 'doc',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: event.target.value,
                                    },
                                ],
                            },
                        ],
                    })
                }
            />
        </div>
    ),
}))

const mockedGetContentPages = vi.mocked(getContentPages)
const mockedGetContentPage = vi.mocked(getContentPage)
const mockedUpdateContentTranslation = vi.mocked(updateContentTranslation)
const mockedPublishContentTranslation = vi.mocked(publishContentTranslation)
const mockedUnpublishContentTranslation = vi.mocked(unpublishContentTranslation)
const mockedDeleteContentTranslation = vi.mocked(deleteContentTranslation)
const mockedDeleteContentPage = vi.mocked(deleteContentPage)

const content: Record<string, unknown> = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Page introduction' }],
        },
    ],
}

function createTranslation(
    locale: 'nl' | 'en',
    overrides: Partial<ContentTranslation> = {},
): ContentTranslation {
    return {
        id: `translation-${locale}`,
        pageId: 'page-1',
        locale,
        slug: locale === 'en' ? 'about-us' : 'over-ons',
        draftTitle: locale === 'en' ? 'About us' : 'Over ons',
        draftContent: content,
        publishedTitle: null,
        publishedContent: null,
        isPublished: false,
        publishedAt: null,
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    }
}

function createPage(
    translations: ContentTranslation[] = [createTranslation('en')],
): ContentPage {
    return {
        id: 'page-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        translations,
    }
}

const page = createPage()

function renderAdminContentPage() {
    return render(
        <MemoryRouter>
            <AdminContentPage />
        </MemoryRouter>,
    )
}

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
    await user.click(
        screen.getByRole('button', { name: /edit/i }),
    )

    await screen.findByRole('heading', { name: /edit page/i })
}

describe('AdminContentPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()

        mockedGetContentPages.mockResolvedValue([page])
        mockedGetContentPage.mockResolvedValue(page)
        mockedUpdateContentTranslation.mockResolvedValue(
            createTranslation('en'),
        )
        mockedPublishContentTranslation.mockResolvedValue(
            createTranslation('en', {
                isPublished: true,
                publishedTitle: 'About us',
                publishedContent: content,
                publishedAt: '2026-01-02T00:00:00.000Z',
            }),
        )
        mockedUnpublishContentTranslation.mockResolvedValue(
            createTranslation('en'),
        )
        mockedDeleteContentTranslation.mockResolvedValue(undefined)
        mockedDeleteContentPage.mockResolvedValue(undefined)
    })

    it('shows a loading state while pages are loading', () => {
        mockedGetContentPages.mockReturnValue(new Promise(() => { }))

        renderAdminContentPage()

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('loads and displays existing pages', async () => {
        renderAdminContentPage()

        expect(await screen.findByText('About us')).toBeInTheDocument()
        expect(mockedGetContentPages).toHaveBeenCalledOnce()
    })

    it('shows an empty state when no pages exist', async () => {
        mockedGetContentPages.mockResolvedValue([])

        renderAdminContentPage()

        expect(await screen.findByText(/no content pages/i)).toBeInTheDocument()
    })

    it('shows an error when loading pages fails', async () => {
        mockedGetContentPages.mockRejectedValueOnce(
            new Error('Request failed'),
        )

        renderAdminContentPage()

        expect(await screen.findByRole('alert')).toBeInTheDocument()
    })

    it('provides a link to create a new page', async () => {
        renderAdminContentPage()

        expect(
            await screen.findByRole('link', { name: /new page/i }),
        ).toHaveAttribute('href', '/admin/content/new')
    })

    it('opens the editor and loads the selected page', async () => {
        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')
        await openEditor(user)

        expect(mockedGetContentPage).toHaveBeenCalledWith('page-1')
        expect(screen.getByLabelText(/title/i)).toHaveValue('About us')
        expect(screen.getByLabelText('Content')).toHaveValue(
            'Page introduction',
        )
    })

    it('saves the current translation', async () => {
        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')
        await openEditor(user)

        await user.clear(screen.getByLabelText(/title/i))
        await user.type(screen.getByLabelText(/title/i), 'Updated title')

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockedUpdateContentTranslation).toHaveBeenCalledWith(
                'page-1',
                'en',
                {
                    draftTitle: 'Updated title',
                    draftContent: content,
                },
            )
        })

        expect(await screen.findByRole('status')).toBeInTheDocument()
    })

    it('shows an error when saving fails', async () => {
        mockedUpdateContentTranslation.mockRejectedValueOnce(
            new Error('Request failed'),
        )

        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')
        await openEditor(user)

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        expect(await screen.findByRole('alert')).toBeInTheDocument()
    })

    it('publishes the selected translation after saving it', async () => {
        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')
        await openEditor(user)

        await user.click(screen.getByRole('button', { name: /^publish$/i }))

        await waitFor(() => {
            expect(mockedUpdateContentTranslation).toHaveBeenCalled()
            expect(mockedPublishContentTranslation).toHaveBeenCalledWith(
                'page-1',
                'en',
            )
        })
    })

    it('unpublishes a published translation', async () => {
        const publishedPage = createPage([
            createTranslation('en', {
                isPublished: true,
                publishedTitle: 'About us',
                publishedContent: content,
                publishedAt: '2026-01-02T00:00:00.000Z',
            }),
        ])

        mockedGetContentPages.mockResolvedValue([publishedPage])
        mockedGetContentPage.mockResolvedValue(publishedPage)

        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')
        await openEditor(user)

        await user.click(
            screen.getByRole('button', { name: /^unpublish$/i }),
        )

        await waitFor(() => {
            expect(mockedUnpublishContentTranslation).toHaveBeenCalledWith(
                'page-1',
                'en',
            )
        })
    })

    it('closes the editor when cancel is clicked', async () => {
        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')
        await openEditor(user)

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(
            screen.queryByRole('heading', { name: /edit page/i }),
        ).not.toBeInTheDocument()
    })

    it('deletes a page after confirmation', async () => {
        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')

        await user.click(screen.getByRole('button', { name: /^delete$/i }))

        expect(screen.getByRole('dialog')).toBeInTheDocument()

        const dialog = screen.getByRole('dialog')
        await user.click(
            within(dialog).getByRole('button', { name: /^delete$/i }),
        )

        await waitFor(() => {
            expect(mockedDeleteContentPage).toHaveBeenCalledWith('page-1')
        })

        expect(await screen.findByText(/no content pages/i)).toBeInTheDocument()
    })

    it('cancels page deletion when the dialog is dismissed', async () => {
        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')

        await user.click(screen.getByRole('button', { name: /^delete$/i }))

        const dialog = screen.getByRole('dialog')
        await user.click(
            within(dialog).getByRole('button', { name: /cancel/i }),
        )

        expect(mockedDeleteContentPage).not.toHaveBeenCalled()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('deletes a translation after confirmation', async () => {
        const bilingualPage = createPage([
            createTranslation('en'),
            createTranslation('nl'),
        ])

        mockedGetContentPages.mockResolvedValue([bilingualPage])
        mockedGetContentPage.mockResolvedValue(bilingualPage)

        const user = userEvent.setup()
        renderAdminContentPage()

        await screen.findByText('About us')
        await openEditor(user)

        await user.click(
            screen.getByRole('button', { name: /delete translation/i }),
        )

        const dialog = screen.getByRole('dialog')
        await user.click(
            within(dialog).getByRole('button', { name: /^delete$/i }),
        )

        await waitFor(() => {
            expect(mockedDeleteContentTranslation).toHaveBeenCalledWith(
                'page-1',
                'en',
            )
        })
    })
})
