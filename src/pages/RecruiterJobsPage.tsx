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
import { useAuth } from '../features/auth/useAuth'
import type { Job, JobStatus } from '../types/job'
import './RecruiterJobsPage.css'

const PAGE_SIZE = 10

type StatusAction = {
    targetStatus: JobStatus
    label: TranslationKey
    execute: (jobId: string) => Promise<Job>
}

type JobSortOption = 'newest' | 'oldest' | 'title' | 'expiry'

type JobFilters = {
    search: string
    status: JobStatus | ''
    employmentType: Job['employmentType'] | ''
    workMode: Job['workMode'] | ''
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
    const { user } = useAuth()
    const isDemo = user?.isDemo === true

    const { t, language } = useTranslation()

    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const [filters, setFilters] = useState<JobFilters>({
        search: '',
        status: '',
        employmentType: '',
        workMode: '',
    })

    const [sortBy, setSortBy] = useState<JobSortOption>('newest')

    const [updatingAction, setUpdatingAction] = useState<{
        jobId: string
        targetStatus: JobStatus
    } | null>(null)

    const [statusFeedback, setStatusFeedback] = useState<{
        jobId: string
        type: 'success' | 'error'
    } | null>(null)

    const employmentTypeLabel = (value: Job['employmentType']) =>
        t(EMPLOYMENT_TYPE_TRANSLATION_KEYS[value])

    const workModeLabel = (value: Job['workMode']) =>
        t(WORK_MODE_TRANSLATION_KEYS[value])

    const statusLabel = (value: Job['status']) =>
        t(`common.${value.toLowerCase()}` as TranslationKey)

    const filteredJobs = jobs
        .filter((job) => {
            const search = filters.search.trim().toLowerCase()

            const matchesSearch =
                !search ||
                job.title.toLowerCase().includes(search) ||
                (job.location ?? '').toLowerCase().includes(search)

            const matchesStatus =
                !filters.status || job.status === filters.status

            const matchesEmploymentType =
                !filters.employmentType ||
                job.employmentType === filters.employmentType

            const matchesWorkMode =
                !filters.workMode || job.workMode === filters.workMode

            return (
                matchesSearch &&
                matchesStatus &&
                matchesEmploymentType &&
                matchesWorkMode
            )
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title, language)

                case 'oldest':
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )

                case 'expiry': {
                    if (!a.expiresAt && !b.expiresAt) return 0
                    if (!a.expiresAt) return 1
                    if (!b.expiresAt) return -1

                    return (
                        new Date(a.expiresAt).getTime() -
                        new Date(b.expiresAt).getTime()
                    )
                }

                case 'newest':
                default:
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
            }
        })

    const paginatedJobs = filteredJobs.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    )

    const jobCounts = {
        total: jobs.length,
        DRAFT: jobs.filter((job) => job.status === 'DRAFT').length,
        PUBLISHED: jobs.filter((job) => job.status === 'PUBLISHED').length,
        PAUSED: jobs.filter((job) => job.status === 'PAUSED').length,
        CLOSED: jobs.filter((job) => job.status === 'CLOSED').length,
    }

    const hasActiveFilters =
        filters.search !== '' ||
        filters.status !== '' ||
        filters.employmentType !== '' ||
        filters.workMode !== ''

    function clearFilters() {
        setFilters({
            search: '',
            status: '',
            employmentType: '',
            workMode: '',
        })
        setSortBy('newest')
        setCurrentPage(1)
    }

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

    useEffect(() => {
        setCurrentPage(1)
    }, [filters, sortBy])

    async function handleStatusChange(
        job: Job,
        targetStatus: JobStatus,
    ) {
        if (isDemo || updatingAction) {
            return
        }

        const action = STATUS_ACTIONS[job.status].find(
            (item) => item.targetStatus === targetStatus,
        )

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

                    {isDemo ? (
                        <button
                            type="button"
                            className="recruiter-jobs-primary-button"
                            disabled
                            title={t('demo.jobCreateDisabled')}
                        >
                            {t('recruiterJobs.newJob')}
                        </button>
                    ) : (
                        <Link
                            className="recruiter-jobs-primary-button"
                            to="/recruiter/jobs/new"
                        >
                            {t('recruiterJobs.newJob')}
                        </Link>
                    )}
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

                {isDemo ? (
                    <button
                        type="button"
                        className="recruiter-jobs-primary-button"
                        disabled
                        title={t('demo.jobCreateDisabled')}
                    >
                        {t('recruiterJobs.newJob')}
                    </button>
                ) : (
                    <Link
                        className="recruiter-jobs-primary-button"
                        to="/recruiter/jobs/new"
                    >
                        {t('recruiterJobs.newJob')}
                    </Link>
                )}
            </div>

            {jobs.length > 0 && (
                <>
                    <section
                        className="recruiter-jobs-overview"
                        aria-label={t('recruiterJobs.overview')}
                    >
                        {(
                            ['total', 'DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED'] as const
                        ).map((status) => (
                            <article
                                className={`recruiter-jobs-stat recruiter-jobs-stat-${status.toLowerCase()}`}
                                key={status}
                            >
                                <span>
                                    {t(
                                        `recruiterJobs.stats.${status}` as TranslationKey,
                                    )}
                                </span>
                                <strong>{jobCounts[status]}</strong>
                            </article>
                        ))}
                    </section>

                    <section
                        className="recruiter-jobs-filters"
                        aria-label={t('recruiterJobs.filters')}
                    >
                        <div className="recruiter-jobs-search">
                            <label htmlFor="recruiter-jobs-search">
                                {t('common.search')}
                            </label>
                            <input
                                id="recruiter-jobs-search"
                                type="search"
                                value={filters.search}
                                placeholder={t(
                                    'recruiterJobs.searchPlaceholder',
                                )}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        search: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="recruiter-jobs-filter">
                            <label htmlFor="recruiter-jobs-status">
                                {t('common.status')}
                            </label>
                            <select
                                id="recruiter-jobs-status"
                                value={filters.status}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        status: event.target.value as JobStatus | '',
                                    }))
                                }
                            >
                                <option value="">
                                    {t('recruiterJobs.allStatuses')}
                                </option>
                                {(
                                    ['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED'] as const
                                ).map((status) => (
                                    <option key={status} value={status}>
                                        {statusLabel(status)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="recruiter-jobs-filter">
                            <label htmlFor="recruiter-jobs-employment">
                                {t('common.employmentType')}
                            </label>
                            <select
                                id="recruiter-jobs-employment"
                                value={filters.employmentType}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        employmentType: event.target.value as
                                            | Job['employmentType']
                                            | '',
                                    }))
                                }
                            >
                                <option value="">
                                    {t('recruiterJobs.allEmploymentTypes')}
                                </option>
                                {Object.keys(
                                    EMPLOYMENT_TYPE_TRANSLATION_KEYS,
                                ).map((value) => (
                                    <option key={value} value={value}>
                                        {employmentTypeLabel(
                                            value as Job['employmentType'],
                                        )}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="recruiter-jobs-filter">
                            <label htmlFor="recruiter-jobs-workmode">
                                {t('common.workMode')}
                            </label>
                            <select
                                id="recruiter-jobs-workmode"
                                value={filters.workMode}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        workMode: event.target.value as
                                            | Job['workMode']
                                            | '',
                                    }))
                                }
                            >
                                <option value="">
                                    {t('recruiterJobs.allWorkModes')}
                                </option>
                                {Object.keys(WORK_MODE_TRANSLATION_KEYS).map(
                                    (value) => (
                                        <option key={value} value={value}>
                                            {workModeLabel(
                                                value as Job['workMode'],
                                            )}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div className="recruiter-jobs-filter">
                            <label htmlFor="recruiter-jobs-sort">
                                {t('recruiterJobs.sortBy')}
                            </label>
                            <select
                                id="recruiter-jobs-sort"
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(
                                        event.target.value as JobSortOption,
                                    )
                                }
                            >
                                <option value="newest">
                                    {t('recruiterJobs.newest')}
                                </option>
                                <option value="oldest">
                                    {t('recruiterJobs.oldest')}
                                </option>
                                <option value="title">
                                    {t('recruiterJobs.sortTitle')}
                                </option>
                                <option value="expiry">
                                    {t('recruiterJobs.expirySoonest')}
                                </option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="recruiter-jobs-clear-filters"
                                onClick={clearFilters}
                            >
                                {t('common.clearFilters')}
                            </button>
                        )}
                    </section>

                    <p
                        className="recruiter-jobs-results-count"
                        aria-live="polite"
                    >
                        {filteredJobs.length} / {jobs.length}
                    </p>
                </>
            )}

            {jobs.length === 0 ? (
                <section className="recruiter-jobs-state">
                    <h2>{t('recruiterJobs.noJobs')}</h2>
                    <p>{t('recruiterJobs.noJobsDescription')}</p>

                    {isDemo ? (
                        <button
                            type="button"
                            className="recruiter-jobs-primary-button"
                            disabled
                            title={t('demo.jobCreateDisabled')}
                        >
                            {t('recruiterJobs.createFirstJob')}
                        </button>
                    ) : (
                        <Link
                            className="recruiter-jobs-primary-button"
                            to="/recruiter/jobs/new"
                        >
                            {t('recruiterJobs.createFirstJob')}
                        </Link>
                    )}
                </section>
            ) : filteredJobs.length === 0 ? (
                <section className="recruiter-jobs-state">
                    <h2>{t('recruiterJobs.noFilteredJobs')}</h2>
                    <p>{t('recruiterJobs.noFilteredJobsDescription')}</p>

                    <button
                        type="button"
                        className="recruiter-jobs-secondary-button"
                        onClick={clearFilters}
                    >
                        {t('common.clearFilters')}
                    </button>
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
                                                disabled={
                                                    isDemo ||
                                                    updatingAction !== null
                                                }
                                                title={
                                                    isDemo
                                                        ? t('demo.jobStatusDisabled')
                                                        : undefined
                                                }
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

                                        <span>{formatSalary(job, t)}</span>

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
                                    {isDemo ? (
                                        <button
                                            type="button"
                                            className="recruiter-jobs-secondary-button"
                                            disabled
                                            title={t('demo.jobEditDisabled')}
                                        >
                                            {t('common.edit')}
                                        </button>
                                    ) : (
                                        <Link
                                            className="recruiter-jobs-secondary-button"
                                            to={`/recruiter/jobs/${job.id}/edit`}
                                        >
                                            {t('common.edit')}
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </section>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredJobs.length}
                        itemsPerPage={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    )
}
