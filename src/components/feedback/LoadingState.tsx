import { useTranslation } from '../../i18n/context'

interface LoadingStateProps {
    message?: string
}

function LoadingState({
    message,
}: LoadingStateProps) {
    const { t } = useTranslation()

    const resolvedMessage =
        message ?? t('feedback.loading')

    return (
        <div role="status" aria-live="polite" aria-busy="true">
            <p>{resolvedMessage}</p>
        </div>
    )
}

export default LoadingState
