interface ErrorStateProps {
    title?: string
    message: string
    onRetry?: () => void
    retryLabel?: string
}

function ErrorState({
    title = 'Something went wrong',
    message,
    onRetry,
    retryLabel = 'Try again',
}: ErrorStateProps) {
    return (
        <div role="alert">
            <h2>{title}</h2>
            <p>{message}</p>

            {onRetry && (
                <button type="button" onClick={onRetry}>
                    {retryLabel}
                </button>
            )}
        </div>
    )
}

export default ErrorState
