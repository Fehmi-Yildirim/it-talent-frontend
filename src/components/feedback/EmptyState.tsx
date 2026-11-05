import type { ReactNode } from 'react'
import './EmptyState.css'

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
        <section className="empty-state" aria-labelledby="empty-state-title">
            <div className="empty-state__content">
                <h2 id="empty-state-title">{title}</h2>
                <p>{message}</p>
                {action && (
                    <div className="empty-state__action">
                        {action}
                    </div>
                )}
            </div>
        </section>
    )
}

export default EmptyState