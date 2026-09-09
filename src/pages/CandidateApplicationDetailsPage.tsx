import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    getMyApplication,
    withdrawApplication,
} from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import { useTranslation } from '../i18n/context'
import type {
    ApplicationStatus,
    CandidateApplicationDetail,
} from '../types/application'
import './CandidateApplicationDetailsPage.css'

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

function formatDate(
    value: string,
    locale: string,
): string {
    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function CandidateApplicationDetailsPage() {
    const { applicationId } =
        useParams<{ applicationId: string }>()

    const { language, t } = useTranslation()

    const [application, setApplication] =
        useState<CandidateApplicationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [withdrawing, setWithdrawing] = useState(false)
    const [errorStatus, setErrorStatus] =
        useState<number | null>(null)
    const [withdrawError, setWithdrawError] =
        useState<string | null>(null)

    const locale =
        language === 'nl' ? 'nl-NL' : 'en-US'

    useEffect(() => {
        let cancelled = false

        async function loadApplication() {
            if (!applicationId) {
                setErrorStatus(404)
                setLoading(false)
                return
            }

            setLoading(true)
            setErrorStatus(null)

            try {
                const result =
                    await getMyApplication(applicationId)

                if (!cancelled) {
                    setApplication(result)
                }
            } catch (caught) {
                if (!cancelled) {
                    setErrorStatus(
                        caught instanceof ApiError
                            ? caught.status
                            : 500,
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadApplication()

        return () => {
            cancelled = true
        }
    }, [applicationId])

    async function handleWithdraw() {
        if (!applicationId || withdrawing) {
            return
        }

        const confirmed = window.confirm(
            t(
                'candidateApplications.details.withdrawConfirmation',
            ),
        )

        if (!confirmed) {
            return
        }

        setWithdrawing(true)
        setWithdrawError(null)

        try {
            await withdrawApplication(applicationId)

            const updatedApplication =
                await getMyApplication(applicationId)

            setApplication(updatedApplication)
        } catch (caught) {
            if (caught instanceof ApiError) {
                if (
                    caught.status === 401 ||
                    caught.status === 403
                ) {
                    setWithdrawError(
                        t(
                            'candidateApplications.details.withdrawUnauthorized',
                        ),
                    )
                } else if (caught.status === 404) {
                    setWithdrawError(
                        t(
                            'candidateApplications.details.withdrawNotFound',
                        ),
                    )
                } else {
                    setWithdrawError(
                        t(
                            'candidateApplications.details.withdrawError',
                        ),
                    )
                }
            } else {
                setWithdrawError(
                    t(
                        'candidateApplications.details.withdrawError',
                    ),
                )
            }
        } finally {
            setWithdrawing(false)
        }
    }

    if (loading) {
        return (
            <section className="candidate-application-details-page">
                <p
                    className="candidate-application-details-loading"
                    role="status"
                    aria-live="polite"
                >
                    {t(
                        'candidateApplications.details.loading',
                    )}
                </p>
            </section>
        )
    }

    if (errorStatus !== null) {
        const isAccessDenied =
            errorStatus === 401 || errorStatus === 403

        const isNotFound = errorStatus === 404

        return (
            <section className="candidate-application-details-page">
                <section
                    className="candidate-application-details-state candidate-application-details-state-error"
                    role="alert"
                >
                    <h1>
                        {isAccessDenied
                            ? t(
                                'candidateApplications.details.accessDenied',
                            )
                            : isNotFound
                                ? t(
                                    'candidateApplications.details.applicationNotFound',
                                )
                                : t(
                                    'candidateApplications.details.unableToLoad',
                                )}
                    </h1>

                    <p>
                        {isAccessDenied
                            ? t(
                                'candidateApplications.details.unauthorized',
                            )
                            : isNotFound
                                ? t(
                                    'candidateApplications.details.notFound',
                                )
                                : t(
                                    'candidateApplications.details.loadError',
                                )}
                    </p>

                    <Link to="/applications">
                        {t(
                            'candidateApplications.details.backToApplications',
                        )}
                    </Link>
                </section>
            </section>
        )
    }

    if (!application) {
        return null
    }

    const canWithdraw =
        application.status === 'PENDING' ||
        application.status === 'REVIEWING'

    return (
        <section className="candidate-application-details-page">
            <header className="candidate-application-details-header">
                <Link
                    to="/applications"
                    className="candidate-application-details-back-link"
                >
                    ←{' '}
                    {t(
                        'candidateApplications.details.backToApplications',
                    )}
                </Link>

                <p className="candidate-application-details-eyebrow">
                    {t(
                        'candidateApplications.details.eyebrow',
                    )}
                </p>

                <div className="candidate-application-details-title-row">
                    <div>
                        <h1>{application.job.title}</h1>

                        <p className="candidate-application-details-company">
                            {application.job.company.name}
                        </p>
                    </div>

                    <span
                        className={`candidate-application-details-status candidate-application-details-status-${application.status.toLowerCase()}`}
                    >
                        {formatStatus(
                            application.status,
                            t,
                        )}
                    </span>
                </div>
            </header>

            <div className="candidate-application-details-grid">
                <section className="candidate-application-details-card">
                    <h2>
                        {t(
                            'candidateApplications.details.jobDetails',
                        )}
                    </h2>

                    <dl>
                        {application.job.location && (
                            <>
                                <dt>
                                    {t(
                                        'candidateApplications.details.location',
                                    )}
                                </dt>

                                <dd>
                                    {application.job.location}
                                </dd>
                            </>
                        )}

                        <dt>
                            {t(
                                'candidateApplications.details.workMode',
                            )}
                        </dt>

                        <dd>
                            {application.job.workMode}
                        </dd>

                        <dt>
                            {t(
                                'candidateApplications.details.employmentType',
                            )}
                        </dt>

                        <dd>
                            {application.job.employmentType}
                        </dd>
                    </dl>
                </section>

                <section className="candidate-application-details-card">
                    <h2>
                        {t(
                            'candidateApplications.details.applicationDetails',
                        )}
                    </h2>

                    <dl>
                        <dt>
                            {t(
                                'candidateApplications.details.status',
                            )}
                        </dt>

                        <dd>
                            {formatStatus(
                                application.status,
                                t,
                            )}
                        </dd>

                        <dt>
                            {t(
                                'candidateApplications.details.applied',
                            )}
                        </dt>

                        <dd>
                            {formatDate(
                                application.createdAt,
                                locale,
                            )}
                        </dd>

                        {application.updatedAt && (
                            <>
                                <dt>
                                    {t(
                                        'candidateApplications.details.lastUpdated',
                                    )}
                                </dt>

                                <dd>
                                    {formatDate(
                                        application.updatedAt,
                                        locale,
                                    )}
                                </dd>
                            </>
                        )}
                    </dl>
                </section>
            </div>

            {application.coverLetter && (
                <section className="candidate-application-details-card">
                    <h2>
                        {t(
                            'candidateApplications.details.coverLetter',
                        )}
                    </h2>

                    <p className="candidate-application-details-cover-letter">
                        {application.coverLetter}
                    </p>
                </section>
            )}

            {canWithdraw && (
                <section className="candidate-application-details-card">
                    <h2>
                        {t(
                            'candidateApplications.details.withdrawApplication',
                        )}
                    </h2>

                    <p>
                        {t(
                            'candidateApplications.details.withdrawDescription',
                        )}
                    </p>

                    {withdrawError && (
                        <p role="alert">
                            {withdrawError}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => void handleWithdraw()}
                        disabled={withdrawing}
                    >
                        {withdrawing
                            ? t(
                                'candidateApplications.details.withdrawing',
                            )
                            : t(
                                'candidateApplications.details.withdrawApplication',
                            )}
                    </button>
                </section>
            )}
        </section>
    )
}

export default CandidateApplicationDetailsPage
