import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications } from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import { useTranslation } from '../i18n/useTranslation'
import type {
    ApplicationStatus,
    CandidateApplication,
} from '../types/application'
import './CandidateApplicationsPage.css'

function formatStatus(
    status: ApplicationStatus,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (status) {
        case 'PENDING':
            return t('candidateApplications.pending')
        case 'REVIEWING':
            return t('candidateApplications.reviewing')
        case 'ACCEPTED':
            return t('candidateApplications.accepted')
        case 'REJECTED':
            return t('candidateApplications.rejected')
        case 'WITHDRAWN':
            return t('candidateApplications.withdrawn')
    }
}

function formatDate(value: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function CandidateApplicationsPage() {
    const { language, t } = useTranslation()

    const [applications, setApplications] = useState<
        CandidateApplication[] | null
    >(null)
    const [loading, setLoading] = useState(true)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const locale = language === 'nl' ? 'nl-NL' : 'en-US'

    useEffect(() => {
        let cancelled = false

        async function loadApplications() {
            setLoading(true)
            setErrorStatus(null)

            try {
                const result = await getMyApplications()

                if (!cancelled) {
                    setApplications(result)
                }
            } catch (caught) {
                if (!cancelled) {
                    if (caught instanceof ApiError) {
                        setErrorStatus(caught.status)
                    } else {
                        setErrorStatus(500)
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadApplications()

        return () => {
            cancelled = true
        }
    }, [retryCount])

    const pageHeader = (
        <>
            <p className="candidate-applications-eyebrow">
                {t('candidateApplications.eyebrow')}
            </p>

            <h1>{t('candidateApplications.title')}</h1>
        </>
    )

    if (loading && !applications) {
        return (
            <section className="candidate-applications-page">
                <header className="candidate-applications-header">
                    {pageHeader}
                </header>

                <p
                    className="candidate-applications-loading"
                    role="status"
                    aria-live="polite"
                >
                    {t('candidateApplications.loading')}
                </p>
            </section>
        )
    }

    if (errorStatus !== null) {
        if (errorStatus === 401 || errorStatus === 403) {
            return (
                <section className="candidate-applications-page">
                    <header className="candidate-applications-header">
                        {pageHeader}
                    </header>

                    <section
                        className="candidate-applications-state candidate-applications-state-error"
                        role="alert"
                    >
                        <h2>
                            {t('candidateApplications.accessDenied')}
                        </h2>

                        <p>
                            {t(
                                'candidateApplications.unauthorized',
                            )}
                        </p>

                        <Link to="/dashboard">
                            {t(
                                'candidateApplications.backToDashboard',
                            )}
                        </Link>
                    </section>
                </section>
            )
        }

        if (errorStatus === 404) {
            return (
                <section className="candidate-applications-page">
                    <header className="candidate-applications-header">
                        {pageHeader}
                    </header>

                    <section
                        className="candidate-applications-state candidate-applications-state-error"
                        role="alert"
                    >
                        <h2>
                            {t(
                                'candidateApplications.applicationsNotFound',
                            )}
                        </h2>

                        <p>
                            {t(
                                'candidateApplications.notFoundDescription',
                            )}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setRetryCount(
                                    (current) => current + 1,
                                )
                            }
                        >
                            {t('candidateApplications.tryAgain')}
                        </button>
                    </section>
                </section>
            )
        }

        return (
            <section className="candidate-applications-page">
                <header className="candidate-applications-header">
                    {pageHeader}
                </header>

                <section
                    className="candidate-applications-state candidate-applications-state-error"
                    role="alert"
                >
                    <h2>
                        {t('candidateApplications.unableToLoad')}
                    </h2>

                    <p>
                        {t('candidateApplications.loadError')}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setRetryCount(
                                (current) => current + 1,
                            )
                        }
                    >
                        {t('candidateApplications.tryAgain')}
                    </button>
                </section>
            </section>
        )
    }

    const items = applications ?? []

    return (
        <section className="candidate-applications-page">
            <header className="candidate-applications-header">
                <div>
                    <p className="candidate-applications-eyebrow">
                        {t('candidateApplications.eyebrow')}
                    </p>

                    <h1>{t('candidateApplications.title')}</h1>

                    <p>
                        {t(
                            'candidateApplications.description',
                        )}
                    </p>
                </div>
            </header>

            {items.length === 0 ? (
                <section className="candidate-applications-state">
                    <h2>
                        {t(
                            'candidateApplications.noApplications',
                        )}
                    </h2>

                    <p>
                        {t(
                            'candidateApplications.noApplicationsDescription',
                        )}
                    </p>

                    <Link
                        to="/jobs"
                        className="candidate-applications-primary-link"
                    >
                        {t('candidateApplications.browseJobs')}
                    </Link>
                </section>
            ) : (
                <>
                    <div className="candidate-applications-results-header">
                        <p>
                            {items.length}{' '}
                            {items.length === 1
                                ? t(
                                    'candidateApplications.application',
                                )
                                : t(
                                    'candidateApplications.applications',
                                )}
                        </p>
                    </div>

                    <div className="candidate-applications-list">
                        {items.map((application) => (
                            <article
                                className="candidate-application-card"
                                key={application.id}
                            >
                                <div className="candidate-application-card-main">
                                    <div className="candidate-application-card-header">
                                        <div>
                                            <h2>
                                                <Link
                                                    to={`/applications/${application.id}`}
                                                >
                                                    {
                                                        application
                                                            .job
                                                            .title
                                                    }
                                                </Link>
                                            </h2>

                                            <p className="candidate-application-company">
                                                {
                                                    application.job
                                                        .company
                                                        .name
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={`candidate-application-status candidate-application-status-${application.status.toLowerCase()}`}
                                        >
                                            {formatStatus(
                                                application.status,
                                                t,
                                            )}
                                        </span>
                                    </div>

                                    <div className="candidate-application-meta">
                                        {application.job.location && (
                                            <span>
                                                {
                                                    application
                                                        .job
                                                        .location
                                                }
                                            </span>
                                        )}

                                        <span>
                                            {
                                                application.job
                                                    .workMode
                                            }
                                        </span>

                                        <span>
                                            {
                                                application.job
                                                    .employmentType
                                            }
                                        </span>

                                        <span>
                                            {t(
                                                'candidateApplications.applied',
                                            )}{' '}
                                            {formatDate(
                                                application.createdAt,
                                                locale,
                                            )}
                                        </span>
                                    </div>

                                    {application.coverLetter && (
                                        <p className="candidate-application-cover-letter">
                                            {t(
                                                'candidateApplications.coverLetterSubmitted',
                                            )}
                                        </p>
                                    )}
                                </div>

                                <Link
                                    to={`/applications/${application.id}`}
                                    className="candidate-application-view-link"
                                >
                                    {t(
                                        'candidateApplications.viewApplication',
                                    )}
                                </Link>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

export default CandidateApplicationsPage
