import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications } from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import type {
    ApplicationStatus,
    CandidateApplication,
} from '../types/application'
import './CandidateApplicationsPage.css'

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
    }).format(new Date(value))
}

function CandidateApplicationsPage() {
    const [applications, setApplications] = useState<
        CandidateApplication[] | null
    >(null)
    const [loading, setLoading] = useState(true)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [retryCount, setRetryCount] = useState(0)

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

    if (loading && !applications) {
        return (
            <section className="candidate-applications-page">
                <header className="candidate-applications-header">
                    <p className="candidate-applications-eyebrow">
                        Candidate
                    </p>
                    <h1>My applications</h1>
                </header>

                <p
                    className="candidate-applications-loading"
                    role="status"
                    aria-live="polite"
                >
                    Loading applications...
                </p>
            </section>
        )
    }

    if (errorStatus !== null) {
        if (errorStatus === 401 || errorStatus === 403) {
            return (
                <section className="candidate-applications-page">
                    <header className="candidate-applications-header">
                        <p className="candidate-applications-eyebrow">
                            Candidate
                        </p>
                        <h1>My applications</h1>
                    </header>

                    <section
                        className="candidate-applications-state candidate-applications-state-error"
                        role="alert"
                    >
                        <h2>Access denied</h2>
                        <p>
                            You are not authorized to view your applications.
                        </p>
                        <Link to="/dashboard">Back to dashboard</Link>
                    </section>
                </section>
            )
        }

        if (errorStatus === 404) {
            return (
                <section className="candidate-applications-page">
                    <header className="candidate-applications-header">
                        <p className="candidate-applications-eyebrow">
                            Candidate
                        </p>
                        <h1>My applications</h1>
                    </header>

                    <section
                        className="candidate-applications-state candidate-applications-state-error"
                        role="alert"
                    >
                        <h2>Applications not found</h2>
                        <p>
                            We could not find your applications right now.
                        </p>
                        <button
                            type="button"
                            onClick={() =>
                                setRetryCount((current) => current + 1)
                            }
                        >
                            Try again
                        </button>
                    </section>
                </section>
            )
        }

        return (
            <section className="candidate-applications-page">
                <header className="candidate-applications-header">
                    <p className="candidate-applications-eyebrow">
                        Candidate
                    </p>
                    <h1>My applications</h1>
                </header>

                <section
                    className="candidate-applications-state candidate-applications-state-error"
                    role="alert"
                >
                    <h2>Unable to load applications</h2>
                    <p>
                        Something went wrong while loading your applications.
                        Please try again.
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            setRetryCount((current) => current + 1)
                        }
                    >
                        Try again
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
                        Candidate
                    </p>
                    <h1>My applications</h1>
                    <p>
                        Track the applications you have submitted and view
                        their current status.
                    </p>
                </div>
            </header>

            {items.length === 0 ? (
                <section className="candidate-applications-state">
                    <h2>No applications yet</h2>
                    <p>
                        You have not applied for any jobs yet. Explore
                        available jobs to find your next opportunity.
                    </p>
                    <Link
                        to="/jobs"
                        className="candidate-applications-primary-link"
                    >
                        Browse jobs
                    </Link>
                </section>
            ) : (
                <>
                    <div className="candidate-applications-results-header">
                        <p>
                            {items.length}{' '}
                            {items.length === 1
                                ? 'application'
                                : 'applications'}
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
                                                    {application.job.title}
                                                </Link>
                                            </h2>

                                            <p className="candidate-application-company">
                                                {application.job.company.name}
                                            </p>
                                        </div>

                                        <span
                                            className={`candidate-application-status candidate-application-status-${application.status.toLowerCase()}`}
                                        >
                                            {formatStatus(application.status)}
                                        </span>
                                    </div>

                                    <div className="candidate-application-meta">
                                        {application.job.location && (
                                            <span>
                                                {application.job.location}
                                            </span>
                                        )}

                                        <span>
                                            {application.job.workMode}
                                        </span>

                                        <span>
                                            {application.job.employmentType}
                                        </span>

                                        <span>
                                            Applied{' '}
                                            {formatDate(application.createdAt)}
                                        </span>
                                    </div>

                                    {application.coverLetter && (
                                        <p className="candidate-application-cover-letter">
                                            Cover letter submitted
                                        </p>
                                    )}
                                </div>

                                <Link
                                    to={`/applications/${application.id}`}
                                    className="candidate-application-view-link"
                                >
                                    View application
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