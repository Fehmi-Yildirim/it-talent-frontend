import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../components/Pagination/Pagination'
import {
    closeJob,
    getJobs,
    pauseJob,
    publishJob,
    reopenJob,
    resumeJob,
} from '../features/jobs/jobs.api'
import {
    EMPLOYMENT_TYPE_TRANSLATION_KEYS,
    WORK_MODE_TRANSLATION_KEYS,
} from '../i18n'
import type { TranslationKey } from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import type { Job, JobStatus } from '../types/job'
import './RecruiterJobsPage.css'

const PAGE_SIZE = 10

type StatusAction = {
    targetStatus: JobStatus
    label: TranslationKey
    execute: (jobId: string) => Promise<Job>
}

const STATUS_ACTIONS: Record<JobStatus, StatusAction[]> = {
    DRAFT: [
        {
            targetStatus: 'PUBLISHED',
            label: 'recruiterJobs.publish',
            execute: publishJob,
        },
    ],
    PUBLISHED: [
        {
            targetStatus: 'PAUSED',
            label: 'recruiterJobs.pause',
            execute: pauseJob,
        },
        {
            targetStatus: 'CLOSED',
            label: 'recruiterJobs.close',
            execute: closeJob,
        },
    ],
    PAUSED: [
        {
            targetStatus: 'PUBLISHED',
            label: 'recruiterJobs.resume',
            execute: resumeJob,
        },
        {
            targetStatus: 'CLOSED',
            label: 'recruiterJobs.close',
            execute: closeJob,
        },
    ],
    CLOSED: [
        {
            targetStatus: 'PUBLISHED',
            label: 'recruiterJobs.reopen',
            execute: reopenJob,
        },
    ],
}

function formatSalary(
    job: Job,
    t: (key: TranslationKey) => string,
): string {
    if (job.salaryMin === null && job.salaryMax === null) {
        return t('recruiterJobs.salaryNotSpecified')
    }

    const currency = job.currency ?? ''

    if (job.salaryMin !== null && job.salaryMax !== null) {
        return `${currency} ${job.salaryMin} - ${job.salaryMax}`
    }

    if (job.salaryMin !== null) {
        return `${currency} ${job.salaryMin}+`
    }

    return `${t('common.upTo')} ${currency} ${job.salaryMax}`
}

function formatDate(date: string, language: string): string {
    return new Date(date).toLocaleDateString(language)
}

export default function RecruiterJobsPage() {
    const { t, language } = useTranslation()

    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const [updatingAction, setUpdatingAction] = useState<{
        jobId: string
        targetStatus: JobStatus
    } | null>(null)

    const [statusFeedback, setStatusFeedback] = useState<{
        jobId: string
        type: 'success' | 'error'
    } | null>(null)

    const paginatedJobs = jobs.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    )

    const employmentTypeLabel = (value: Job['employmentType']) =>
        t(EMPLOYMENT_TYPE_TRANSLATION_KEYS[value])

    const workModeLabel = (value: Job['workMode']) =>
        t(WORK_MODE_TRANSLATION_KEYS[value])

    const statusLabel = (value: Job['status']) =>
        t(`common.${value.toLowerCase()}` as TranslationKey)

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
                    setError(t('recruiterJobs.loadError'))
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
    }, [t])

    // Hide the status feedback icon after 3 seconds.
    useEffect(() => {
        if (!statusFeedback) {
            return
        }

        const timeout = window.setTimeout(() => {
            setStatusFeedback(null)
        }, 3000)

        return () => {
            window.clearTimeout(timeout)
        }
    }, [statusFeedback])

    async function handleStatusChange(
        job: Job,
        targetStatus: JobStatus,
    ) {
        if (updatingAction) {
            return
        }

        const action = STATUS_ACTIONS[job.status].find(
            (item) => item.targetStatus === targetStatus,
        )

        // Prevent invalid status transitions.
        if (!action) {
            return
        }

        setUpdatingAction({
            jobId: job.id,
            targetStatus,
        })

        setStatusFeedback(null)

        try {
            const updatedJob = await action.execute(job.id)

            setJobs((currentJobs) =>
                currentJobs.map((currentJob) =>
                    currentJob.id === updatedJob.id
                        ? updatedJob
                        : currentJob,
                ),
            )

            setStatusFeedback({
                jobId: job.id,
                type: 'success',
            })
        } catch {
            setStatusFeedback({
                jobId: job.id,
                type: 'error',
            })
        } finally {
            setUpdatingAction(null)
        }
    }

    if (loading) {
        return (
            <div className="recruiter-jobs-page">
                <div className="recruiter-jobs-header">
                    <div>
                        <h1>{t('recruiterJobs.title')}</h1>
                        <p>{t('recruiterJobs.description')}</p>
                    </div>
                </div>

                <div className="recruiter-jobs-state" role="status">
                    {t('recruiterJobs.loading')}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="recruiter-jobs-page">
                <div className="recruiter-jobs-header">
                    <div>
                        <h1>{t('recruiterJobs.title')}</h1>
                        <p>{t('recruiterJobs.description')}</p>
                    </div>

                    <Link
                        className="recruiter-jobs-primary-button"
                        to="/recruiter/jobs/new"
                    >
                        {t('recruiterJobs.newJob')}
                    </Link>
                </div>

                <div className="recruiter-jobs-state recruiter-jobs-state-error">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="recruiter-jobs-secondary-button"
                        onClick={() => window.location.reload()}
                    >
                        {t('common.tryAgain')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="recruiter-jobs-page">
            <div className="recruiter-jobs-header">
                <div>
                    <h1>{t('recruiterJobs.title')}</h1>
                    <p>{t('recruiterJobs.description')}</p>
                </div>

                <Link
                    className="recruiter-jobs-primary-button"
                    to="/recruiter/jobs/new"
                >
                    {t('recruiterJobs.newJob')}
                </Link>
            </div>

            {jobs.length === 0 ? (
                <section className="recruiter-jobs-state">
                    <h2>{t('recruiterJobs.noJobs')}</h2>
                    <p>{t('recruiterJobs.noJobsDescription')}</p>

                    <Link
                        className="recruiter-jobs-primary-button"
                        to="/recruiter/jobs/new"
                    >
                        {t('recruiterJobs.createFirstJob')}
                    </Link>
                </section>
            ) : (
                <>
                    <section
                        className="recruiter-jobs-list"
                        aria-label={t('recruiterJobs.yourJobs')}
                    >
                        {paginatedJobs.map((job) => (
                            <article
                                className="recruiter-job-card"
                                key={job.id}
                            >
                                <div className="recruiter-job-card-main">
                                    <div className="recruiter-job-card-title">
                                        <h2>
                                            <Link
                                                className="recruiter-job-title-link"
                                                to={`/recruiter/jobs/${job.id}`}
                                            >
                                                {job.title}
                                            </Link>
                                        </h2>

                                        <label className="recruiter-job-status-control">
                                            <select
                                                className={`recruiter-job-status recruiter-job-status-${job.status.toLowerCase()}`}
                                                aria-label={`${job.title} status`}
                                                value={job.status}
                                                disabled={updatingAction !== null}
                                                onChange={(event) =>
                                                    void handleStatusChange(
                                                        job,
                                                        event.target.value as JobStatus,
                                                    )
                                                }
                                            >
                                                <option value={job.status}>
                                                    {statusLabel(job.status)}
                                                </option>

                                                {STATUS_ACTIONS[job.status].map(
                                                    (action) => (
                                                        <option
                                                            key={action.targetStatus}
                                                            value={action.targetStatus}
                                                        >
                                                            {t(action.label)}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </label>

                                        {statusFeedback?.jobId === job.id && (
                                            <span
                                                className={`recruiter-job-status-icon recruiter-job-status-icon-${statusFeedback.type}`}
                                                role={
                                                    statusFeedback.type === 'error'
                                                        ? 'alert'
                                                        : 'status'
                                                }
                                                aria-label={
                                                    statusFeedback.type === 'success'
                                                        ? 'Status updated successfully'
                                                        : 'Status update failed'
                                                }
                                            >
                                                {statusFeedback.type === 'success'
                                                    ? '✓'
                                                    : '!'}
                                            </span>
                                        )}
                                    </div>

                                    <p className="recruiter-job-location">
                                        {job.location ??
                                            t('recruiterJobs.locationNotSpecified')}
                                    </p>

                                    <div className="recruiter-job-meta">
                                        <span>
                                            {employmentTypeLabel(
                                                job.employmentType,
                                            )}
                                        </span>

                                        <span>
                                            {workModeLabel(job.workMode)}
                                        </span>

                                        <span>
                                            {formatSalary(job, t)}
                                        </span>

                                        <span>
                                            {t('recruiterJobs.expirationDate')}:{' '}
                                            {job.expiresAt
                                                ? formatDate(
                                                    job.expiresAt,
                                                    language,
                                                )
                                                : t('common.notSpecified')}
                                        </span>
                                    </div>
                                </div>

                                <div className="recruiter-job-card-actions">
                                    <Link
                                        className="recruiter-jobs-secondary-button"
                                        to={`/recruiter/jobs/${job.id}/edit`}
                                    >
                                        {t('common.edit')}
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={jobs.length}
                        itemsPerPage={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    )
}