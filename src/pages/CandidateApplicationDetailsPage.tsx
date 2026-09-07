import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    getMyApplication,
    withdrawApplication,
} from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import type {
    ApplicationStatus,
    CandidateApplicationDetail,
} from '../types/application'
import './CandidateApplicationDetailsPage.css'

function formatStatus(status: ApplicationStatus): string {
    switch (status) {
        case 'PENDING':
            return 'Pending'
        case 'REVIEWING':
            return 'Reviewing'
        case 'ACCEPTED':
            return 'Accepted'
        case 'REJECTED':
            return 'Rejected'
        case 'WITHDRAWN':
            return 'Withdrawn'
    }
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function CandidateApplicationDetailsPage() {
    const { applicationId } = useParams<{ applicationId: string }>()

    const [application, setApplication] =
        useState<CandidateApplicationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [withdrawing, setWithdrawing] = useState(false)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [withdrawError, setWithdrawError] = useState<string | null>(null)

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
                const result = await getMyApplication(applicationId)

                if (!cancelled) {
                    setApplication(result)
                }
            } catch (caught) {
                if (!cancelled) {
                    setErrorStatus(
                        caught instanceof ApiError ? caught.status : 500,
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
            'Are you sure you want to withdraw this application?',
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
                if (caught.status === 401 || caught.status === 403) {
                    setWithdrawError(
                        'You are not authorized to withdraw this application.',
                    )
                } else if (caught.status === 404) {
                    setWithdrawError(
                        'The application could not be found.',
                    )
                } else {
                    setWithdrawError(
                        'Unable to withdraw the application. Please try again.',
                    )
                }
            } else {
                setWithdrawError(
                    'Unable to withdraw the application. Please try again.',
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
                    Loading application...
                </p>
            </section>
        )
    }

    if (errorStatus !== null) {
        const isAccessDenied = errorStatus === 401 || errorStatus === 403
        const isNotFound = errorStatus === 404

        return (
            <section className="candidate-application-details-page">
                <section
                    className="candidate-application-details-state candidate-application-details-state-error"
                    role="alert"
                >
                    <h1>
                        {isAccessDenied
                            ? 'Access denied'
                            : isNotFound
                                ? 'Application not found'
                                : 'Unable to load application'}
                    </h1>

                    <p>
                        {isAccessDenied
                            ? 'You are not authorized to view this application.'
                            : isNotFound
                                ? 'The application could not be found or is no longer available.'
                                : 'Something went wrong while loading this application. Please try again later.'}
                    </p>

                    <Link to="/applications">
                        Back to applications
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
                    ← Back to applications
                </Link>

                <p className="candidate-application-details-eyebrow">
                    Candidate application
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
                        {formatStatus(application.status)}
                    </span>
                </div>
            </header>

            <div className="candidate-application-details-grid">
                <section className="candidate-application-details-card">
                    <h2>Job details</h2>

                    <dl>
                        {application.job.location && (
                            <>
                                <dt>Location</dt>
                                <dd>{application.job.location}</dd>
                            </>
                        )}

                        <dt>Work mode</dt>
                        <dd>{application.job.workMode}</dd>

                        <dt>Employment type</dt>
                        <dd>{application.job.employmentType}</dd>
                    </dl>
                </section>

                <section className="candidate-application-details-card">
                    <h2>Application details</h2>

                    <dl>
                        <dt>Status</dt>
                        <dd>{formatStatus(application.status)}</dd>

                        <dt>Applied</dt>
                        <dd>{formatDate(application.createdAt)}</dd>

                        {application.updatedAt && (
                            <>
                                <dt>Last updated</dt>
                                <dd>{formatDate(application.updatedAt)}</dd>
                            </>
                        )}
                    </dl>
                </section>
            </div>

            {application.coverLetter && (
                <section className="candidate-application-details-card">
                    <h2>Cover letter</h2>

                    <p className="candidate-application-details-cover-letter">
                        {application.coverLetter}
                    </p>
                </section>
            )}

            {canWithdraw && (
                <section className="candidate-application-details-card">
                    <h2>Withdraw application</h2>

                    <p>
                        You can withdraw your application while it is still
                        being processed.
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
                            ? 'Withdrawing...'
                            : 'Withdraw application'}
                    </button>
                </section>
            )}
        </section>
    )
}

export default CandidateApplicationDetailsPage