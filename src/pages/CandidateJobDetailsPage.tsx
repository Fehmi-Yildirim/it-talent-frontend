import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../services/api/apiError'
import { getCandidateJobById } from '../features/jobs/jobs.api'
import type { CandidateJob } from '../types/job'
import './CandidateJobDetailsPage.css'

function formatSalary(
    salaryMin: string | number | null,
    salaryMax: string | number | null,
    currency: string | null,
): string {
    if (salaryMin === null && salaryMax === null) {
        return 'Not specified'
    }

    const currencyLabel = currency ? ` ${currency} ` : ''

    if (salaryMin !== null && salaryMax !== null) {
        return `${salaryMin} - ${salaryMax}${currencyLabel} `
    }

    if (salaryMin !== null) {
        return `From ${salaryMin}${currencyLabel} `
    }

    return `Up to ${salaryMax}${currencyLabel} `

}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not specified'
    }


    return new Intl.DateTimeFormat('en', {
        dateStyle: 'long',
    }).format(new Date(value))


}

function CandidateJobDetailsPage() {
    const { jobId } = useParams()
    const navigate = useNavigate()


    const [job, setJob] = useState<CandidateJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function loadJob() {
            if (!jobId) {
                setErrorStatus(404)
                setLoading(false)
                return
            }

            setLoading(true)
            setErrorStatus(null)
            setJob(null)

            try {
                const result = await getCandidateJobById(jobId)

                if (!cancelled) {
                    setJob(result)
                }
            } catch (caught) {
                if (!cancelled) {
                    if (caught instanceof ApiError) {
                        setErrorStatus(caught.status)
                    } else {
                        setErrorStatus(0)
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadJob()

        return () => {
            cancelled = true
        }
    }, [jobId, retryCount])

    if (loading) {
        return (
            <section className="candidate-job-details-page">
                <p role="status" aria-live="polite">
                    Loading job...
                </p>
            </section>
        )
    }

    if (!job) {
        const notFound = errorStatus === 404

        return (
            <section className="candidate-job-details-page">
                <div
                    className="candidate-job-details-state"
                    role="alert"
                >
                    <h1>
                        {notFound
                            ? 'Job not found'
                            : 'Unable to load job'}
                    </h1>

                    <p>
                        {notFound
                            ? 'This job is no longer available or could not be found.'
                            : 'Something went wrong while loading this job. Please try again.'}
                    </p>

                    <div className="candidate-job-details-actions">
                        {!notFound && (
                            <button
                                type="button"
                                onClick={() =>
                                    setRetryCount((current) => current + 1)
                                }
                            >
                                Try again
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => navigate('/jobs')}
                        >
                            Back to jobs
                        </button>
                    </div>
                </div>
            </section>
        )
    }

    const requiredSkills = job.requirements.filter(
        (requirement) => requirement.required,
    )

    const preferredSkills = job.requirements.filter(
        (requirement) => !requirement.required,
    )

    return (
        <section className="candidate-job-details-page">
            <Link
                to="/jobs"
                className="candidate-job-details-back"
            >
                ← Back to jobs
            </Link>

            <article className="candidate-job-details">
                <header className="candidate-job-details-header">
                    <div>
                        <p className="candidate-job-details-eyebrow">
                            Job opportunity
                        </p>

                        <h1>{job.title}</h1>

                        <p className="candidate-job-details-company">
                            {job.company.name}
                        </p>
                    </div>
                </header>

                <div className="candidate-job-details-meta">
                    {job.location && (
                        <div>
                            <dt>Location</dt>
                            <dd>{job.location}</dd>
                        </div>
                    )}

                    <div>
                        <dt>Work mode</dt>
                        <dd>{job.workMode}</dd>
                    </div>

                    <div>
                        <dt>Employment type</dt>
                        <dd>{job.employmentType}</dd>
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
                </div>

                <section className="candidate-job-details-section">
                    <h2>About the job</h2>

                    <div className="candidate-job-description">
                        {job.description
                            .split('\n')
                            .map((paragraph, index) => (
                                <p key={`${index}-${paragraph} `}>
                                    {paragraph}
                                </p>
                            ))}
                    </div>
                </section>

                <section className="candidate-job-details-section">
                    <h2>Required skills</h2>

                    {requiredSkills.length === 0 ? (
                        <p>No required skills specified.</p>
                    ) : (
                        <ul className="candidate-job-skill-list">
                            {requiredSkills.map((requirement) => (
                                <li key={requirement.id}>
                                    <strong>
                                        {requirement.skill.name}
                                    </strong>

                                    <span>
                                        Minimum level:{' '}
                                        {requirement.minimumLevel}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="candidate-job-details-section">
                    <h2>Preferred skills</h2>

                    {preferredSkills.length === 0 ? (
                        <p>No preferred skills specified.</p>
                    ) : (
                        <ul className="candidate-job-skill-list">
                            {preferredSkills.map((requirement) => (
                                <li key={requirement.id}>
                                    <strong>
                                        {requirement.skill.name}
                                    </strong>

                                    <span>
                                        Minimum level:{' '}
                                        {requirement.minimumLevel}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="candidate-job-details-section">
                    <h2>Company</h2>

                    <dl className="candidate-job-company-details">
                        <div>
                            <dt>Name</dt>
                            <dd>{job.company.name}</dd>
                        </div>

                        {job.company.location && (
                            <div>
                                <dt>Location</dt>
                                <dd>{job.company.location}</dd>
                            </div>
                        )}

                        {job.company.website && (
                            <div>
                                <dt>Website</dt>
                                <dd>
                                    <a
                                        href={job.company.website}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {job.company.website}
                                    </a>
                                </dd>
                            </div>
                        )}
                    </dl>

                    {job.company.description && (
                        <p>{job.company.description}</p>
                    )}
                </section>

                <footer className="candidate-job-details-footer">
                    <div>
                        <strong>Published</strong>

                        <span>
                            {formatDate(job.publishedAt)}
                        </span>
                    </div>

                    <div>
                        <strong>Expires</strong>

                        <span>
                            {formatDate(job.expiresAt)}
                        </span>
                    </div>
                </footer>
            </article>
        </section>
    )


}

export default CandidateJobDetailsPage
