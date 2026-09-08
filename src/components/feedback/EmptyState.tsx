import type { ReactNode } from 'react'

interface EmptyStateProps {
    title: string
    message: string
    action?: ReactNode
}

function EmptyState({
    title,
    message,
    action,
}: EmptyStateProps) {
    return (
        <div>
            <h2>{title}</h2>
            <p>{message}</p>
            {action}
        </div>
    )
}

export default EmptyState
