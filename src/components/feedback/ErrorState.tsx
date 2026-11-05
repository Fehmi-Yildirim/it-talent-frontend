import { useTranslation } from '../../i18n/useTranslation'
import './ErrorState.css'

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
        retryLabel ?? t('common.tryAgain')

    return (
        <section className="error-state" role="alert">
            <div className="error-state__icon" aria-hidden="true">
                !
            </div>

            <div className="error-state__content">
                <h2>{resolvedTitle}</h2>
                <p>{message}</p>

                {onRetry && (
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={onRetry}
                    >
                        {resolvedRetryLabel}
                    </button>
                )}
            </div>
        </section>
    )
}

export default ErrorState