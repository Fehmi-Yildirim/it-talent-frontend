import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecruiterApplications } from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import type {
    ApplicationStatus,
    RecruiterApplication,
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

function RecruiterApplicationsPage() {
    const [applications, setApplications] = useState<
        RecruiterApplication[]
    >([])
    const [selectedJob, setSelectedJob] = useState('')
    const [selectedStatus, setSelectedStatus] =
        useState<ApplicationStatus | ''>('')
    const [loading, setLoading] = useState(true)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)

    useEffect(() => {
        let cancelled = false

        async function loadApplications() {
            setLoading(true)
            setErrorStatus(null)

            try {
                const result = await getRecruiterApplications()

                if (!cancelled) {
                    setApplications(result)
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

        void loadApplications()

        return () => {
            cancelled = true
        }
    }, [])

    const jobs = useMemo(() => {
        const uniqueJobs = new Map<string, string>()

        for (const application of applications) {
            uniqueJobs.set(
                application.job.id,
                application.job.title,
            )
        }

        return Array.from(uniqueJobs.entries()).sort((a, b) =>
            a[1].localeCompare(b[1]),
        )
    }, [applications])

    const filteredApplications = useMemo(() => {
        return applications.filter((application) => {
            const matchesJob =
                selectedJob === '' ||
                application.job.id === selectedJob

            const matchesStatus =
                selectedStatus === '' ||
                application.status === selectedStatus

            return matchesJob && matchesStatus
        })
    }, [applications, selectedJob, selectedStatus])

    if (loading) {
        return (
            <section className="recruiter-applications-page">
                <p role="status" aria-live="polite">
                    Loading applications...
                </p>
            </section>
        )
    }

    if (errorStatus !== null) {
        const isAccessDenied =
            errorStatus === 401 || errorStatus === 403

        return (
            <section className="recruiter-applications-page">
                <section role="alert">
                    <h1>
                        {isAccessDenied
                            ? 'Access denied'
                            : 'Unable to load applications'}
                    </h1>

                    <p>
                        {isAccessDenied
                            ? 'You are not authorized to view recruiter applications.'
                            : 'Something went wrong while loading applications. Please try again later.'}
                    </p>
                </section>
            </section>
        )
    }

    return (
        <section className="recruiter-applications-page">
            <header>
                <p>Recruiter</p>
                <h1>Applications</h1>
                <p>
                    Review applications submitted to your job
                    postings.
                </p>
            </header>

            <section aria-label="Application filters">
                <label>
                    Job
                    <select
                        value={selectedJob}
                        onChange={(event) =>
                            setSelectedJob(event.target.value)
                        }
                    >
                        <option value="">All jobs</option>

                        {jobs.map(([jobId, jobTitle]) => (
                            <option key={jobId} value={jobId}>
                                {jobTitle}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Status
                    <select
                        value={selectedStatus}
                        onChange={(event) =>
                            setSelectedStatus(
                                event.target.value as
                                | ApplicationStatus
                                | '',
                            )
                        }
                    >
                        <option value="">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWING">
                            Reviewing
                        </option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WITHDRAWN">
                            Withdrawn
                        </option>
                    </select>
                </label>
            </section>

            {filteredApplications.length === 0 ? (
                <section>
                    <h2>No applications found</h2>
                    <p>
                        No applications match the selected filters.
                    </p>
                </section>
            ) : (
                <div>
                    {filteredApplications.map((application) => (
                        <article key={application.id}>
                            <header>
                                <h2>
                                    <Link
                                        to={`/recruiter/applications/${application.id}`}
                                    >
                                        {application.job.title}
                                    </Link>
                                </h2>

                                <span>
                                    {formatStatus(application.status)}
                                </span>
                            </header>

                            <p>
                                {application.candidate.firstName}{' '}
                                {application.candidate.lastName}
                            </p>

                            <p>
                                Applied:{' '}
                                {formatDate(application.createdAt)}
                            </p>

                            {application.coverLetter && (
                                <p>Cover letter included</p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default RecruiterApplicationsPage