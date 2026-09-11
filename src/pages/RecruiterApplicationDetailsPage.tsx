import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    getRecruiterApplication,
    updateApplicationStatus,
} from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import type {
    ApplicationStatus,
    RecruiterApplicationDetail,
} from '../types/application'
import { useTranslation } from '../i18n/useTranslation'

function RecruiterApplicationDetailsPage() {
    const { applicationId } = useParams<{
        applicationId: string
    }>()

    const { language, t } = useTranslation()

    const [application, setApplication] =
        useState<RecruiterApplicationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [updateError, setUpdateError] = useState<string | null>(null)

    function formatStatus(status: ApplicationStatus): string {
        switch (status) {
            case 'PENDING':
                return t('recruiterApplications.pending')
            case 'REVIEWING':
                return t('recruiterApplications.reviewing')
            case 'ACCEPTED':
                return t('recruiterApplications.accepted')
            case 'REJECTED':
                return t('recruiterApplications.rejected')
            case 'WITHDRAWN':
                return t('recruiterApplications.withdrawn')
        }
    }

    function formatDate(value: string): string {
        return new Intl.DateTimeFormat(
            language === 'nl' ? 'nl-NL' : 'en-US',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            },
        ).format(new Date(value))
    }

    useEffect(() => {
        let cancelled = false

        async function loadApplication() {
            if (!applicationId) {
                setErrorStatus(404)
                setLoading(false)
                return
            }

            try {
                const result =
                    await getRecruiterApplication(applicationId)

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

    async function handleStatusChange(
        status: ApplicationStatus,
    ) {
        if (!applicationId || updating) {
            return
        }

        setUpdating(true)
        setUpdateError(null)

        try {
            const result = await updateApplicationStatus(
                applicationId,
                { status },
            )

            setApplication(result)
        } catch (caught) {
            if (caught instanceof ApiError) {
                if (
                    caught.status === 401 ||
                    caught.status === 403
                ) {
                    setUpdateError(
                        t(
                            'recruiterApplications.details.updateUnauthorized',
                        ),
                    )
                } else if (caught.status === 400) {
                    setUpdateError(
                        t(
                            'recruiterApplications.details.invalidStatus',
                        ),
                    )
                } else {
                    setUpdateError(
                        t(
                            'recruiterApplications.details.updateError',
                        ),
                    )
                }
            } else {
                setUpdateError(
                    t(
                        'recruiterApplications.details.updateError',
                    ),
                )
            }
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <section>
                <p role="status" aria-live="polite">
                    {t('recruiterApplications.details.loading')}
                </p>
            </section>
        )
    }

    if (errorStatus !== null) {
        const isAccessDenied =
            errorStatus === 401 || errorStatus === 403
        const isNotFound = errorStatus === 404

        return (
            <section>
                <section role="alert">
                    <h1>
                        {isAccessDenied
                            ? t(
                                'recruiterApplications.details.accessDenied',
                            )
                            : isNotFound
                                ? t(
                                    'recruiterApplications.details.applicationNotFound',
                                )
                                : t(
                                    'recruiterApplications.details.unableToLoad',
                                )}
                    </h1>

                    <p>
                        {isAccessDenied
                            ? t(
                                'recruiterApplications.details.unauthorized',
                            )
                            : isNotFound
                                ? t(
                                    'recruiterApplications.details.notFound',
                                )
                                : t(
                                    'recruiterApplications.details.loadError',
                                )}
                    </p>

                    <Link to="/recruiter/applications">
                        {t(
                            'recruiterApplications.details.backToApplications',
                        )}
                    </Link>
                </section>
            </section>
        )
    }

    if (!application) {
        return null
    }

    return (
        <section>
            <header>
                <Link to="/recruiter/applications">
                    ←{' '}
                    {t(
                        'recruiterApplications.details.backToApplications',
                    )}
                </Link>

                <p>
                    {t(
                        'recruiterApplications.details.eyebrow',
                    )}
                </p>

                <h1>{application.job.title}</h1>

                <p>
                    {application.candidate.firstName}{' '}
                    {application.candidate.lastName}
                </p>
            </header>

            <section>
                <h2>
                    {t(
                        'recruiterApplications.details.application',
                    )}
                </h2>

                <dl>
                    <dt>
                        {t(
                            'recruiterApplications.status',
                        )}
                    </dt>
                    <dd>{formatStatus(application.status)}</dd>

                    <dt>
                        {t(
                            'recruiterApplications.details.applied',
                        )}
                    </dt>
                    <dd>{formatDate(application.createdAt)}</dd>

                    {application.updatedAt && (
                        <>
                            <dt>
                                {t(
                                    'recruiterApplications.details.lastUpdated',
                                )}
                            </dt>
                            <dd>
                                {formatDate(
                                    application.updatedAt,
                                )}
                            </dd>
                        </>
                    )}
                </dl>
            </section>

            <section>
                <h2>
                    {t(
                        'recruiterApplications.details.candidate',
                    )}
                </h2>

                <dl>
                    <dt>
                        {t(
                            'recruiterApplications.details.name',
                        )}
                    </dt>
                    <dd>
                        {application.candidate.firstName}{' '}
                        {application.candidate.lastName}
                    </dd>
                </dl>
            </section>

            {application.coverLetter && (
                <section>
                    <h2>
                        {t(
                            'recruiterApplications.details.coverLetter',
                        )}
                    </h2>

                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {application.coverLetter}
                    </p>
                </section>
            )}

            {application.status !== 'WITHDRAWN' && (
                <section>
                    <h2>
                        {t(
                            'recruiterApplications.details.updateStatus',
                        )}
                    </h2>

                    {updateError && (
                        <p role="alert">{updateError}</p>
                    )}

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            void handleStatusChange('PENDING')
                        }
                    >
                        {t(
                            'recruiterApplications.pending',
                        )}
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            void handleStatusChange('REVIEWING')
                        }
                    >
                        {t(
                            'recruiterApplications.reviewing',
                        )}
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            void handleStatusChange('ACCEPTED')
                        }
                    >
                        {t(
                            'recruiterApplications.details.accept',
                        )}
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            void handleStatusChange('REJECTED')
                        }
                    >
                        {t(
                            'recruiterApplications.details.reject',
                        )}
                    </button>

                    {updating && (
                        <p role="status">
                            {t(
                                'recruiterApplications.details.updatingStatus',
                            )}
                        </p>
                    )}
                </section>
            )}
        </section>
    )
}

export default RecruiterApplicationDetailsPage
