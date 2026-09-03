import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    closeJob,
    getJobById,
    publishJob,
} from '../features/jobs/jobs.api'
import type { Job, JobRequirement } from '../types/job'
import './RecruiterJobDetailsPage.css'

function formatLabel(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(' ')
}

function formatSalary(
    salaryMin: string | number | null,
    salaryMax: string | number | null,
    currency: string | null,
): string {
    if (salaryMin === null && salaryMax === null) {
        return 'Not specified'
    }

    const symbol = currency ? `${currency} ` : ''

    if (salaryMin !== null && salaryMax !== null) {
        return `${symbol}${salaryMin} - ${salaryMax}`
    }

    if (salaryMin !== null) {
        return `${symbol}${salaryMin}+`
    }

    return `Up to ${symbol}${salaryMax}`
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not specified'
    }

    return new Date(value).toLocaleDateString()
}

function RequirementRow({
    requirement,
}: {
    requirement: JobRequirement
}) {
    return (
        <div className="recruiter-job-requirement">
            <div>
                <strong>{requirement.skill.name}</strong>

                <span>
                    {requirement.required ? 'Required' : 'Preferred'}
                </span>
            </div>

            <span>
                Minimum level: {requirement.minimumLevel}
            </span>
        </div>
    )
}

export default function RecruiterJobDetailsPage() {
    const navigate = useNavigate()
    const { jobId } = useParams()

    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (!jobId) {
            setError('Job ID is missing.')
            setLoading(false)
            return
        }

        const currentJobId = jobId
        let active = true

        async function loadJob() {
            setLoading(true)
            setError('')

            try {
                const response = await getJobById(currentJobId)

                if (active) {
                    setJob(response)
                }
            } catch {
                if (active) {
                    setError('Unable to load this job.')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        void loadJob()

        return () => {
            active = false
        }
    }, [jobId])

    async function handlePublish() {
        if (!jobId || !job) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await publishJob(jobId)
            setJob(response)
            setSuccess('Job published successfully.')
        } catch {
            setError('Unable to publish this job. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    async function handleClose() {
        if (!jobId || !job) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await closeJob(jobId)
            setJob(response)
            setSuccess('Job closed successfully.')
        } catch {
            setError('Unable to close this job. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="recruiter-job-details-page">
                <div
                    className="recruiter-job-details-state"
                    role="status"
                >
                    Loading job...
                </div>
            </main>
        )
    }

    if (error && !job) {
        return (
            <main className="recruiter-job-details-page">
                <div className="recruiter-job-details-state recruiter-job-details-error">
                    <p>{error}</p>

                    <Link
                        className="recruiter-job-details-secondary-button"
                        to="/recruiter/jobs"
                    >
                        Back to jobs
                    </Link>
                </div>
            </main>
        )
    }

    if (!job) {
        return (
            <main className="recruiter-job-details-page">
                <div className="recruiter-job-details-state">
                    Job not found.
                </div>
            </main>
        )
    }

    const requiredRequirements = job.requirements.filter(
        (requirement) => requirement.required,
    )

    const preferredRequirements = job.requirements.filter(
        (requirement) => !requirement.required,
    )

    return (
        <main className="recruiter-job-details-page">
            <header className="recruiter-job-details-header">
                <div>
                    <Link
                        className="recruiter-job-details-back"
                        to="/recruiter/jobs"
                    >
                        ← Back to jobs
                    </Link>

                    <h1>{job.title}</h1>

                    <div className="recruiter-job-details-meta">
                        <span
                            className={`recruiter-job-details-status recruiter-job-details-status-${job.status.toLowerCase()}`}
                        >
                            {formatLabel(job.status)}
                        </span>

                        <span>{formatLabel(job.employmentType)}</span>
                        <span>{formatLabel(job.workMode)}</span>

                        {job.location && (
                            <span>{job.location}</span>
                        )}
                    </div>
                </div>

                <div className="recruiter-job-details-actions">
                    {job.status === 'DRAFT' && (
                        <>
                            <Link
                                className="recruiter-job-details-secondary-button"
                                to={`/recruiter/jobs/${job.id}/edit`}
                            >
                                Edit
                            </Link>

                            <button
                                className="recruiter-job-details-primary-button"
                                type="button"
                                onClick={() => void handlePublish()}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? 'Publishing...'
                                    : 'Publish job'}
                            </button>
                        </>
                    )}

                    {job.status === 'PUBLISHED' && (
                        <>
                            <Link
                                className="recruiter-job-details-secondary-button"
                                to={`/recruiter/jobs/${job.id}/edit`}
                            >
                                Edit
                            </Link>

                            <button
                                className="recruiter-job-details-danger-button"
                                type="button"
                                onClick={() => void handleClose()}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? 'Closing...'
                                    : 'Close job'}
                            </button>
                        </>
                    )}

                    {job.status === 'CLOSED' && (
                        <Link
                            className="recruiter-job-details-secondary-button"
                            to={`/recruiter/jobs/${job.id}/edit`}
                        >
                            Edit
                        </Link>
                    )}
                </div>
            </header>

            {success && (
                <div
                    className="recruiter-job-details-success"
                    role="status"
                >
                    {success}
                </div>
            )}

            {error && (
                <div
                    className="recruiter-job-details-alert"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="recruiter-job-details-layout">
                <section className="recruiter-job-details-card">
                    <h2>Job description</h2>

                    <p className="recruiter-job-details-description">
                        {job.description}
                    </p>
                </section>

                <section className="recruiter-job-details-card">
                    <h2>Job information</h2>

                    <dl className="recruiter-job-details-list">
                        <div>
                            <dt>Employment type</dt>
                            <dd>{formatLabel(job.employmentType)}</dd>
                        </div>

                        <div>
                            <dt>Work mode</dt>
                            <dd>{formatLabel(job.workMode)}</dd>
                        </div>

                        <div>
                            <dt>Location</dt>
                            <dd>{job.location || 'Not specified'}</dd>
                        </div>

                        <div>
                            <dt>Salary</dt>
                            <dd>
                                {formatSalary(
                                    job.salaryMin,
                                    job.salaryMax,
                                    job.currency,
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt>Expiration date</dt>
                            <dd>{formatDate(job.expiresAt)}</dd>
                        </div>

                        <div>
                            <dt>Published</dt>
                            <dd>{formatDate(job.publishedAt)}</dd>
                        </div>
                    </dl>
                </section>

                <section className="recruiter-job-details-card">
                    <div className="recruiter-job-details-section-header">
                        <div>
                            <h2>Requirements</h2>

                            <p>
                                Skills required or preferred for this
                                position.
                            </p>
                        </div>

                        <Link
                            className="recruiter-job-details-secondary-button"
                            to={`/recruiter/jobs/${job.id}/edit`}
                        >
                            Manage requirements
                        </Link>
                    </div>

                    {job.requirements.length === 0 ? (
                        <p className="recruiter-job-details-muted">
                            No requirements configured.
                        </p>
                    ) : (
                        <div className="recruiter-job-details-requirements">
                            {requiredRequirements.length > 0 && (
                                <div>
                                    <h3>Required skills</h3>

                                    {requiredRequirements.map(
                                        (requirement) => (
                                            <RequirementRow
                                                key={requirement.id}
                                                requirement={requirement}
                                            />
                                        ),
                                    )}
                                </div>
                            )}

                            {preferredRequirements.length > 0 && (
                                <div>
                                    <h3>Preferred skills</h3>

                                    {preferredRequirements.map(
                                        (requirement) => (
                                            <RequirementRow
                                                key={requirement.id}
                                                requirement={requirement}
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>

            <footer className="recruiter-job-details-footer">
                <button
                    className="recruiter-job-details-secondary-button"
                    type="button"
                    onClick={() => navigate('/recruiter/jobs')}
                >
                    Back to jobs
                </button>
            </footer>
        </main>
    )
}
