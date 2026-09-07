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

function RecruiterApplicationDetailsPage() {
    const { applicationId } = useParams<{
        applicationId: string
    }>()

    const [application, setApplication] =
        useState<RecruiterApplicationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [updateError, setUpdateError] = useState<string | null>(null)

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
                        'You are not authorized to update this application.',
                    )
                } else if (caught.status === 400) {
                    setUpdateError(
                        'This application status is not valid.',
                    )
                } else {
                    setUpdateError(
                        'Unable to update the application status.',
                    )
                }
            } else {
                setUpdateError(
                    'Unable to update the application status.',
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
                    Loading application...
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
                            ? 'Access denied'
                            : isNotFound
                                ? 'Application not found'
                                : 'Unable to load application'}
                    </h1>

                    <p>
                        {isAccessDenied
                            ? 'You are not authorized to view this application.'
                            : isNotFound
                                ? 'The application could not be found.'
                                : 'Something went wrong while loading this application.'}
                    </p>

                    <Link to="/recruiter/applications">
                        Back to applications
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
                    ← Back to applications
                </Link>

                <p>Recruiter application</p>

                <h1>{application.job.title}</h1>

                <p>
                    {application.candidate.firstName}{' '}
                    {application.candidate.lastName}
                </p>
            </header>

            <section>
                <h2>Application</h2>

                <dl>
                    <dt>Status</dt>
                    <dd>{formatStatus(application.status)}</dd>

                    <dt>Applied</dt>
                    <dd>{formatDate(application.createdAt)}</dd>

                    {application.updatedAt && (
                        <>
                            <dt>Last updated</dt>
                            <dd>
                                {formatDate(application.updatedAt)}
                            </dd>
                        </>
                    )}
                </dl>
            </section>
            <section>
                <h2>Candidate</h2>

                <dl>
                    <dt>Name</dt>
                    <dd>
                        {application.candidate.firstName}{' '}
                        {application.candidate.lastName}
                    </dd>
                </dl>
            </section>

            {application.coverLetter && (
                <section>
                    <h2>Cover letter</h2>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {application.coverLetter}
                    </p>
                </section>
            )}

            {application.status !== 'WITHDRAWN' && (
                <section>
                    <h2>Update status</h2>

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
                        Pending
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            void handleStatusChange('REVIEWING')
                        }
                    >
                        Reviewing
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            void handleStatusChange('ACCEPTED')
                        }
                    >
                        Accept
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            void handleStatusChange('REJECTED')
                        }
                    >
                        Reject
                    </button>

                    {updating && (
                        <p role="status">
                            Updating status...
                        </p>
                    )}
                </section>
            )}
        </section>
    )
}

export default RecruiterApplicationDetailsPage