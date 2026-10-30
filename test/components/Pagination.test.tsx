import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '../test-utils'
import { describe, expect, it, vi } from 'vitest'

import Pagination from '../../src/components/Pagination/Pagination'

describe('Pagination', () => {
    it('renders the page buttons when there are multiple pages', () => {
        render(
            <Pagination
                currentPage={1}
                totalItems={25}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('navigation', { name: 'Pagination' }),
        ).toBeInTheDocument()

        expect(screen.getByRole('button', { name: 'Page 1' }))
            .toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Page 2' }))
            .toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Page 3' }))
            .toBeInTheDocument()
    })

    it('does not render when there is only one page', () => {
        const { container } = render(
            <Pagination
                currentPage={1}
                totalItems={5}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('does not render when there are no items', () => {
        const { container } = render(
            <Pagination
                currentPage={1}
                totalItems={0}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('disables previous on the first page', () => {
        render(
            <Pagination
                currentPage={1}
                totalItems={25}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Previous' }),
        ).toBeDisabled()
    })

    it('disables next on the last page', () => {
        render(
            <Pagination
                currentPage={3}
                totalItems={25}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Next' }),
        ).toBeDisabled()
    })

    it('calls onPageChange when a page number is clicked', async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn()

        render(
            <Pagination
                currentPage={1}
                totalItems={25}
                itemsPerPage={10}
                onPageChange={onPageChange}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Page 2' }))

        expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('supports previous and next navigation', async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn()

        render(
            <Pagination
                currentPage={2}
                totalItems={25}
                itemsPerPage={10}
                onPageChange={onPageChange}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Previous' }))
        expect(onPageChange).toHaveBeenLastCalledWith(1)

        await user.click(screen.getByRole('button', { name: 'Next' }))
        expect(onPageChange).toHaveBeenLastCalledWith(3)
    })

    it('marks the current page with aria-current', () => {
        render(
            <Pagination
                currentPage={2}
                totalItems={25}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Page 2' }),
        ).toHaveAttribute('aria-current', 'page')
    })
})
