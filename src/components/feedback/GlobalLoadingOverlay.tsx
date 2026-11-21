import { useEffect, useState } from 'react'
import { apiLoading } from '../../services/api/apiLoading'
import { useTranslation } from '../../i18n/useTranslation'
import './GlobalLoadingOverlay.css'

function GlobalLoadingOverlay() {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        return apiLoading.subscribe(setIsLoading)
    }, [])

    useEffect(() => {
        if (!isLoading) {
            setIsVisible(false)
            return
        }

        const timeout = window.setTimeout(() => {
            setIsVisible(true)
        }, 300)

        return () => window.clearTimeout(timeout)
    }, [isLoading])

    if (!isVisible) {
        return null
    }

    return (
        <div
            className="global-loading-overlay"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="global-loading-panel">
                <div className="global-loading-spinner" />

                <span className="global-loading-eyebrow">
                    IT TALENT PLATFORM
                </span>

                <h2>{t('landing.demoStartup.title')}</h2>

                <p className="global-loading-description">
                    {t('landing.demoStartup.description')}
                </p>

                <div className="demo-loading-services">
                    {(['render', 'neon', 'github'] as const).map(
                        (service) => (
                            <div className="demo-service" key={service}>
                                <span
                                    className={`demo-service-indicator ${service === 'github' ? 'idle' : 'active'
                                        }`}
                                />

                                <div>
                                    <strong>
                                        {t(`landing.demoStartup.${service}.name`)}
                                    </strong>

                                    <span>
                                        {t(
                                            `landing.demoStartup.${service}.description`,
                                        )}
                                    </span>
                                </div>

                                <span className="demo-service-status">
                                    {t(`landing.demoStartup.${service}.status`)}
                                </span>
                            </div>
                        ),
                    )}
                </div>

                <div className="global-loading-progress">
                    <span />
                </div>
            </div>
        </div>
    )
}

export default GlobalLoadingOverlay
