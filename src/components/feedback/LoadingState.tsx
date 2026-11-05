import { useTranslation } from '../../i18n/useTranslation'
import './LoadingState.css'

interface LoadingStateProps {
    message?: string
}

function LoadingState({ message }: LoadingStateProps) {
    const { t } = useTranslation()

    const resolvedMessage = message ?? t('feedback.loading')

    return (
        <div
            className="loading-state"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <span className="loading-state__spinner" aria-hidden="true" />
            <p className="loading-state__message">{resolvedMessage}</p>
        </div>
    )
}

export default LoadingState