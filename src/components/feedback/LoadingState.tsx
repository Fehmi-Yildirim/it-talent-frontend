interface LoadingStateProps {
    message?: string
}

function LoadingState({
    message = 'Loading...',
}: LoadingStateProps) {
    return (
        <div role="status" aria-live="polite" aria-busy="true">
            <p>{message}</p>
        </div>
    )
}

export default LoadingState
