import { useTranslation } from '../../i18n/useTranslation'

interface ErrorStateProps {
    title?: string
    message: string
    onRetry?: () => void
    retryLabel?: string
}

function ErrorState({
    title,
    message,
    onRetry,
    retryLabel,
}: ErrorStateProps) {
    const { t } = useTranslation()

    const resolvedTitle =
        title ?? t('feedback.somethingWentWrong')

    const resolvedRetryLabel =
        retryLabel ?? t('feedback.tryAgain')

    return (
        <div role="alert">
            <h2>{resolvedTitle}</h2>
            <p>{message}</p>

            {onRetry && (
                <button type="button" onClick={onRetry}>
                    {resolvedRetryLabel}
                </button>
            )}
        </div>
    )
}

export default ErrorState
