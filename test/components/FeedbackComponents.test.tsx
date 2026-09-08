import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LoadingState from '../../src/components/feedback/LoadingState'
import ErrorState from '../../src/components/feedback/ErrorState'
import EmptyState from '../../src/components/feedback/EmptyState'

describe('feedback components', () => {
    it('renders a loading state', () => {
        render(<LoadingState message="Loading profile..." />)

        expect(screen.getByRole('status')).toHaveAttribute(
            'aria-busy',
            'true',
        )
        expect(screen.getByText('Loading profile...')).toBeInTheDocument()
    })

    it('renders an error state with retry', () => {
        const onRetry = vi.fn()

        render(
            <ErrorState
                title="Profile unavailable"
                message="Please try again."
                onRetry={onRetry}
            />,
        )

        expect(
            screen.getByRole('alert'),
        ).toBeInTheDocument()

        screen.getByRole('button', { name: 'Try again' }).click()

        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('renders an empty state with an action', () => {
        render(
            <EmptyState
                title="No jobs found"
                message="Try another search."
                action={<button type="button">Clear filters</button>}
            />,
        )

        expect(
            screen.getByRole('heading', { name: 'No jobs found' }),
        ).toBeInTheDocument()

        expect(screen.getByText('Try another search.')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Clear filters' }),
        ).toBeInTheDocument()
    })
})
