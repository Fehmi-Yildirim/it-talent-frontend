import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../features/jobs/jobs.api'
import type { Job } from '../types/job'
import './RecruiterJobsPage.css'

function formatEmploymentType(value: Job['employmentType']): string {
    return value
        .split('_')
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(' ')
}

function formatWorkMode(value: Job['workMode']): string {
    return value.charAt(0) + value.slice(1).toLowerCase()
}

function formatStatus(value: Job['status']): string {
    return value.charAt(0) + value.slice(1).toLowerCase()
}

function formatSalary(job: Job): string {
    if (job.salaryMin === null && job.salaryMax === null) {
        return 'Salary not specified'
    }

    const currency = job.currency ?? ''

    if (job.salaryMin !== null && job.salaryMax !== null) {
        return `${currency} ${job.salaryMin} - ${job.salaryMax}`
    }

    if (job.salaryMin !== null) {
        return `${currency} ${job.salaryMin}+`
    }

    return `Up to ${currency} ${job.salaryMax}`
}

export default function RecruiterJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        async function loadJobs() {
            setLoading(true)
            setError('')

            try {
                const response = await getJobs()

                if (active) {
                    setJobs(response)
                }
            } catch {
                if (active) {
                    setError('Unable to load your jobs. Please try again.')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        void loadJobs()

        return () => {
            active = false
        }
    }, [])

    if (loading) {
        return (
            <main className="recruiter-jobs-page">
                <div className="recruiter-jobs-header">
                    <div>
                        <h1>Jobs</h1>
                        <p>Manage your company&apos;s job vacancies.</p>
                    </div>
                </div>

                <div className="recruiter-jobs-state" role="status">
                    Loading jobs...
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="recruiter-jobs-page">
                <div className="recruiter-jobs-header">
                    <div>
                        <h1>Jobs</h1>
                        <p>Manage your company&apos;s job vacancies.</p>
                    </div>

                    <Link
                        className="recruiter-jobs-primary-button"
                        to="/recruiter/jobs/new"
                    >
                        New Job
                    </Link>
                </div>

                <div className="recruiter-jobs-state recruiter-jobs-state-error">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="recruiter-jobs-secondary-button"
                        onClick={() => window.location.reload()}
                    >
                        Try again
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="recruiter-jobs-page">
            <div className="recruiter-jobs-header">
                <div>
                    <h1>Jobs</h1>
                    <p>Manage your company&apos;s job vacancies.</p>
                </div>

                <Link
                    className="recruiter-jobs-primary-button"
                    to="/recruiter/jobs/new"
                >
                    New Job
                </Link>
            </div>

            {jobs.length === 0 ? (
                <section className="recruiter-jobs-state">
                    <h2>No jobs yet</h2>
                    <p>Create your first job vacancy to start recruiting.</p>

                    <Link
                        className="recruiter-jobs-primary-button"
                        to="/recruiter/jobs/new"
                    >
                        Create your first job
                    </Link>
                </section>
            ) : (
                <section className="recruiter-jobs-list" aria-label="Your jobs">
                    {jobs.map((job) => (
                        <article className="recruiter-job-card" key={job.id}>
                            <div className="recruiter-job-card-main">
                                <div className="recruiter-job-card-title">
                                    <h2>{job.title}</h2>

                                    <span
                                        className={`recruiter-job-status recruiter-job-status-${job.status.toLowerCase()}`}
                                    >
                                        {formatStatus(job.status)}
                                    </span>
                                </div>

                                <p className="recruiter-job-location">
                                    {job.location ?? 'Location not specified'}
                                </p>

                                <div className="recruiter-job-meta">
                                    <span>{formatEmploymentType(job.employmentType)}</span>
                                    <span>{formatWorkMode(job.workMode)}</span>
                                    <span>{formatSalary(job)}</span>
                                </div>
                            </div>

                            <div className="recruiter-job-card-actions">
                                <Link
                                    className="recruiter-jobs-secondary-button"
                                    to={`/recruiter/jobs/${job.id}`}
                                >
                                    View
                                </Link>

                                <Link
                                    className="recruiter-jobs-secondary-button"
                                    to={`/recruiter/jobs/${job.id}/edit`}
                                >
                                    Edit
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    )
}
