import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import {
    closeJob,
    getJobById,
    pauseJob,
    publishJob,
    reopenJob,
    resumeJob,
} from '../features/jobs/jobs.api'
import { useAuth } from '../features/auth/useAuth'
import {
    EMPLOYMENT_TYPE_TRANSLATION_KEYS,
    LOCALES,
    WORK_MODE_TRANSLATION_KEYS,
} from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import type { Job, JobRequirement } from '../types/job'
import './RecruiterJobDetailsPage.css'
import Pagination from '../components/Pagination/Pagination'
import { getCandidatesForJob } from '../features/matching/matching.api'
import type {
    MatchingMeta,
    RecruiterCandidateMatch,
} from '../types/matching'

type ActiveTab = 'description' | 'matching'

function formatSalaryValue(
    value: string | number,
    currency: string,
): string {
    const amount = typeof value === 'number' ? value : Number(value)

    if (!Number.isFinite(amount)) {
        return ''
    }

    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatSalary(
    salaryMin: string | number | null,
    salaryMax: string | number | null,
    currency: string | null,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    if (salaryMin === null && salaryMax === null) {
        return t('recruiterJobs.salaryNotSpecified')
    }

    const currencyCode = currency || 'EUR'

    if (salaryMin !== null && salaryMax !== null) {
        return `${formatSalaryValue(
            salaryMin,
            currencyCode,
        )} - ${formatSalaryValue(
            salaryMax,
            currencyCode,
        )}`
    }

    if (salaryMin !== null) {
        return `${formatSalaryValue(salaryMin, currencyCode)}+`
    }

    return `${t('common.upTo')} ${formatSalaryValue(
        salaryMax as string | number,
        currencyCode,
    )}`
}

function formatDate(
    value: string | null,
    locale: string,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    if (!value) {
        return t('recruiterJobs.salaryNotSpecified')
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function RequirementRow({
    requirement,
    t,
}: {
    requirement: JobRequirement
    t: (key: import('../i18n').TranslationKey) => string
}) {
    return (
        <div className="recruiter-job-requirement">
            <div>
                <strong>{requirement.skill.name}</strong>

                <span>
                    {requirement.required
                        ? t('common.required')
                        : t('common.preferred')}
                </span>
            </div>

            <span>
                {t('common.minimumLevel')}: {requirement.minimumLevel}
            </span>
        </div>
    )
}

export default function RecruiterJobDetailsPage() {
    const { jobId } = useParams()
    const { user } = useAuth()
    const { language, t } = useTranslation()

    const isDemo = user?.isDemo === true

    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [activeTab, setActiveTab] = useState<ActiveTab>('description')

    const [candidateMatches, setCandidateMatches] = useState<
        RecruiterCandidateMatch[]
    >([])
    const [matchesMeta, setMatchesMeta] = useState<MatchingMeta | null>(null)
    const [matchesLoading, setMatchesLoading] = useState(false)
    const [matchesError, setMatchesError] = useState(false)
    const [matchesPage, setMatchesPage] = useState(1)
    const [matchesRetry, setMatchesRetry] = useState(0)
    const [matchesFilter, setMatchesFilter] = useState<
        'all' | 'strong' | 'partial' | 'none'
    >('all')
    const [matchesSort, setMatchesSort] = useState<'desc' | 'asc'>('desc')
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

    const locale = LOCALES[language]

    const formatEmploymentType = (
        value: Job['employmentType'],
    ): string => {
        return t(EMPLOYMENT_TYPE_TRANSLATION_KEYS[value])
    }

    const formatWorkMode = (
        value: Job['workMode'],
    ): string => {
        return t(WORK_MODE_TRANSLATION_KEYS[value])
    }

    const formatStatus = (
        value: Job['status'],
    ): string => {
        switch (value) {
            case 'DRAFT':
                return t('common.draft')
            case 'PUBLISHED':
                return t('common.published')
            case 'PAUSED':
                return t('common.paused')
            case 'CLOSED':
                return t('common.closed')
            default:
                return value
        }
    }

    useEffect(() => {
        if (!jobId) {
            setError(t('recruiterJobs.jobIdMissing'))
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
                    setActiveTab('description')
                    setMatchesPage(1)
                    setCandidateMatches([])
                    setMatchesMeta(null)
                    setMatchesError(false)
                    setExpandedMatchId(null)
                }
            } catch {
                if (active) {
                    setError(t('recruiterJobs.unableToLoadDetails'))
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
    }, [jobId, t])

    useEffect(() => {
        if (!jobId || job?.status !== 'PUBLISHED') {
            setCandidateMatches([])
            setMatchesMeta(null)
            setMatchesLoading(false)
            return
        }

        // Haal kandidaten pas op wanneer de matching-tab geopend is.
        if (activeTab !== 'matching') {
            setMatchesLoading(false)
            return
        }

        let cancelled = false
        const currentJobId = jobId

        async function loadCandidateMatches() {
            setMatchesLoading(true)
            setMatchesError(false)

            try {
                const response = await getCandidatesForJob(currentJobId, {
                    page: matchesPage,
                    limit: 5,
                    scoreRange: matchesFilter,
                })

                if (!cancelled) {
                    setCandidateMatches(response.data)
                    setMatchesMeta(response.meta)
                }
            } catch {
                if (!cancelled) {
                    setMatchesError(true)
                }
            } finally {
                if (!cancelled) {
                    setMatchesLoading(false)
                }
            }
        }

        void loadCandidateMatches()

        return () => {
            cancelled = true
        }
    }, [
        jobId,
        job?.status,
        activeTab,
        matchesPage,
        matchesRetry,
        matchesFilter,
    ])

    async function refreshJob() {
        if (!jobId) {
            return
        }

        const response = await getJobById(jobId)
        setJob(response)
        setMatchesPage(1)
        setCandidateMatches([])
        setMatchesMeta(null)
    }

    async function handlePublish() {
        if (isDemo || !jobId || !job || actionLoading) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccess('')

        try {
            await publishJob(jobId)
            await refreshJob()
            setSuccess(t('recruiterJobs.publishedSuccessfully'))
        } catch {
            setError(t('recruiterJobs.publishError'))
        } finally {
            setActionLoading(false)
        }
    }

    async function handlePause() {
        if (isDemo || !jobId || !job || actionLoading) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccess('')

        try {
            await pauseJob(jobId)
            await refreshJob()
            setSuccess(t('recruiterJobs.pausedSuccessfully'))
        } catch {
            setError(t('recruiterJobs.pauseError'))
        } finally {
            setActionLoading(false)
        }
    }

    async function handleResume() {
        if (isDemo || !jobId || !job || actionLoading) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccess('')

        try {
            await resumeJob(jobId)
            await refreshJob()
            setSuccess(t('recruiterJobs.resumedSuccessfully'))
        } catch {
            setError(t('recruiterJobs.resumeError'))
        } finally {
            setActionLoading(false)
        }
    }

    async function handleClose() {
        if (isDemo || !jobId || !job || actionLoading) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccess('')

        try {
            await closeJob(jobId)
            await refreshJob()
            setSuccess(t('recruiterJobs.closedSuccessfully'))
        } catch {
            setError(t('recruiterJobs.closeError'))
        } finally {
            setActionLoading(false)
        }
    }

    async function handleReopen() {
        if (isDemo || !jobId || !job || actionLoading) {
            return
        }

        setActionLoading(true)
        setError('')
        setSuccess('')

        try {
            await reopenJob(jobId)
            await refreshJob()
            setSuccess(t('recruiterJobs.reopenedSuccessfully'))
        } catch {
            setError(t('recruiterJobs.reopenError'))
        } finally {
            setActionLoading(false)
        }
    }

    function handleTabChange(tab: ActiveTab) {
        setActiveTab(tab)
        setExpandedMatchId(null)
    }

    if (loading) {
        return (
            <div className="recruiter-job-details-page">
                <div
                    className="recruiter-job-details-state"
                    role="status"
                >
                    {t('recruiterJobForm.loading')}
                </div>
            </div>
        )
    }

    if (error && !job) {
        return (
            <div className="recruiter-job-details-page">
                <div className="recruiter-job-details-state recruiter-job-details-error">
                    <p>{error}</p>

                    <Link to="/recruiter/jobs" className="back-link">
                        {t('recruiterJobs.backToJobs')}
                    </Link>
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="recruiter-job-details-page">
                <div className="recruiter-job-details-state">
                    {t('recruiterJobs.jobNotFound')}
                </div>
            </div>
        )
    }

    const requirements = job.requirements ?? []

    const requiredRequirements = requirements.filter(
        (requirement) => requirement.required,
    )

    const preferredRequirements = requirements.filter(
        (requirement) => !requirement.required,
    )

    const visibleCandidateMatches = [...candidateMatches].sort((a, b) => {
        const difference = Number(b.overallScore) - Number(a.overallScore)
        return matchesSort === 'desc' ? difference : -difference
    })

    const strongMatchesOnPage = candidateMatches.filter(
        (match) => Number(match.overallScore) >= 80,
    ).length

    const matchFilterLabels = {
        all: t('recruiterMatches.allCandidates'),
        strong: t('recruiterMatches.strongMatchesFilter'),
        partial: t('recruiterMatches.partialMatchesFilter'),
        none: t('recruiterMatches.noMatchesFilter'),
    } as const

    return (
        <div className="recruiter-job-details-page">
            <header className="recruiter-job-details-header">
                <div>
                    <h1>{job.title}</h1>

                    <div className="recruiter-job-details-meta">
                        <span
                            className={`recruiter-job-details-status recruiter-job-details-status-${job.status.toLowerCase()}`}
                        >
                            {formatStatus(job.status)}
                        </span>

                        <span>{formatEmploymentType(job.employmentType)}</span>
                        <span>{formatWorkMode(job.workMode)}</span>

                        {job.location && <span>{job.location}</span>}
                    </div>
                </div>

                <div className="recruiter-job-details-actions">
                    <Link to="/recruiter/jobs" className="btn btn-secondary">
                        ← {t('recruiterJobs.backToJobs')}
                    </Link>

                    {job.status === 'DRAFT' && (
                        <>
                            <Link
                                className={`btn btn-secondary${isDemo ? ' demo-disabled-link' : ''}`}
                                to={isDemo ? '#' : `/recruiter/jobs/${job.id}/edit`}
                                aria-disabled={isDemo}
                                tabIndex={isDemo ? -1 : undefined}
                                onClick={(event) => {
                                    if (isDemo) event.preventDefault()
                                }}
                                title={isDemo ? t('demo.jobEditDisabled') : undefined}
                            >
                                {t('common.edit')}
                            </Link>

                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => void handlePublish()}
                                disabled={isDemo || actionLoading}
                                title={isDemo ? t('demo.jobPublishDisabled') : undefined}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.publishing')
                                    : t('recruiterJobs.publish')}
                            </button>
                        </>
                    )}

                    {job.status === 'PUBLISHED' && (
                        <>
                            <Link
                                className={`btn btn-secondary${isDemo ? ' demo-disabled-link' : ''}`}
                                to={isDemo ? '#' : `/recruiter/jobs/${job.id}/edit`}
                                aria-disabled={isDemo}
                                tabIndex={isDemo ? -1 : undefined}
                                onClick={(event) => {
                                    if (isDemo) event.preventDefault()
                                }}
                                title={isDemo ? t('demo.jobEditDisabled') : undefined}
                            >
                                {t('common.edit')}
                            </Link>

                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => void handlePause()}
                                disabled={isDemo || actionLoading}
                                title={isDemo ? t('demo.jobPauseDisabled') : undefined}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.pausing')
                                    : t('recruiterJobs.pause')}
                            </button>

                            <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => void handleClose()}
                                disabled={isDemo || actionLoading}
                                title={isDemo ? t('demo.jobCloseDisabled') : undefined}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.closing')
                                    : t('recruiterJobs.close')}
                            </button>
                        </>
                    )}

                    {job.status === 'PAUSED' && (
                        <>
                            <Link
                                className={`btn btn-secondary${isDemo ? ' demo-disabled-link' : ''}`}
                                to={isDemo ? '#' : `/recruiter/jobs/${job.id}/edit`}
                                aria-disabled={isDemo}
                                tabIndex={isDemo ? -1 : undefined}
                                onClick={(event) => {
                                    if (isDemo) event.preventDefault()
                                }}
                                title={isDemo ? t('demo.jobEditDisabled') : undefined}
                            >
                                {t('common.edit')}
                            </Link>

                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => void handleResume()}
                                disabled={isDemo || actionLoading}
                                title={isDemo ? t('demo.jobResumeDisabled') : undefined}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.resuming')
                                    : t('recruiterJobs.resume')}
                            </button>

                            <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => void handleClose()}
                                disabled={isDemo || actionLoading}
                                title={isDemo ? t('demo.jobCloseDisabled') : undefined}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.closing')
                                    : t('recruiterJobs.close')}
                            </button>
                        </>
                    )}

                    {job.status === 'CLOSED' && (
                        <>
                            <Link
                                className={`btn btn-secondary${isDemo ? ' demo-disabled-link' : ''}`}
                                to={isDemo ? '#' : `/recruiter/jobs/${job.id}/edit`}
                                aria-disabled={isDemo}
                                tabIndex={isDemo ? -1 : undefined}
                                onClick={(event) => {
                                    if (isDemo) event.preventDefault()
                                }}
                                title={isDemo ? t('demo.jobEditDisabled') : undefined}
                            >
                                {t('common.edit')}
                            </Link>

                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => void handleReopen()}
                                disabled={isDemo || actionLoading}
                                title={isDemo ? t('demo.jobReopenDisabled') : undefined}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.reopening')
                                    : t('recruiterJobs.reopen')}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {success && (
                <div className="recruiter-job-details-success" role="status">
                    {success}
                </div>
            )}

            {error && (
                <div className="recruiter-job-details-alert" role="alert">
                    {error}
                </div>
            )}

            <div
                className="recruiter-job-details-tabs"
                role="group"
                aria-label={t('recruiterJobDetails.tabsLabel')}
            >
                <button
                    type="button"
                    className={`recruiter-job-details-tab${activeTab === 'description' ? ' is-active' : ''}`}
                    aria-pressed={activeTab === 'description'}
                    onClick={() => handleTabChange('description')}
                >
                    {t('recruiterJobs.jobDescription')}
                </button>

                <button
                    type="button"
                    className={`recruiter-job-details-tab${activeTab === 'matching' ? ' is-active' : ''}`}
                    aria-pressed={activeTab === 'matching'}
                    onClick={() => handleTabChange('matching')}
                >
                    {t('recruiterMatches.title')}
                </button>
            </div>

            <div className="recruiter-job-details-layout">
                {activeTab === 'description' && (
                    <>
                        <section className="recruiter-job-details-card">
                            <h2>{t('recruiterJobs.jobDescription')}</h2>

                            <div
                                className="recruiter-job-details-description"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(job.description),
                                }}
                            />
                        </section>

                        <section className="recruiter-job-details-card">
                            <h2>{t('recruiterJobs.jobInformation')}</h2>

                            <dl className="recruiter-job-details-list">
                                <div>
                                    <dt>{t('common.employmentType')}</dt>
                                    <dd>{formatEmploymentType(job.employmentType)}</dd>
                                </div>

                                <div>
                                    <dt>{t('common.workMode')}</dt>
                                    <dd>{formatWorkMode(job.workMode)}</dd>
                                </div>

                                <div>
                                    <dt>{t('recruiterJobs.locationNotSpecified')}</dt>
                                    <dd>
                                        {job.location ||
                                            t('recruiterJobs.locationNotSpecified')}
                                    </dd>
                                </div>

                                <div>
                                    <dt>{t('common.salary')}</dt>
                                    <dd>
                                        {formatSalary(
                                            job.salaryMin,
                                            job.salaryMax,
                                            job.currency,
                                            t,
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt>{t('recruiterJobs.expirationDate')}</dt>
                                    <dd>{formatDate(job.expiresAt, locale, t)}</dd>
                                </div>

                                <div>
                                    <dt>{t('common.published')}</dt>
                                    <dd>{formatDate(job.publishedAt, locale, t)}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="recruiter-job-details-card">
                            <div className="recruiter-job-details-section-header">
                                <div>
                                    <h2>{t('recruiterJobs.requirements')}</h2>
                                    <p>{t('recruiterJobs.requirementsDescription')}</p>
                                </div>

                                <Link
                                    className={`btn btn-secondary${isDemo ? ' demo-disabled-link' : ''}`}
                                    to={isDemo ? '#' : `/recruiter/jobs/${job.id}/edit`}
                                    aria-disabled={isDemo}
                                    tabIndex={isDemo ? -1 : undefined}
                                    onClick={(event) => {
                                        if (isDemo) event.preventDefault()
                                    }}
                                    title={isDemo ? t('demo.jobRequirementsDisabled') : undefined}
                                >
                                    {t('recruiterJobs.manageRequirements')}
                                </Link>
                            </div>

                            {requirements.length === 0 ? (
                                <p className="recruiter-job-details-muted">
                                    {t('recruiterJobs.noRequirements')}
                                </p>
                            ) : (
                                <div className="recruiter-job-details-requirements">
                                    {requiredRequirements.length > 0 && (
                                        <div>
                                            <h3>{t('recruiterJobs.requiredSkills')}</h3>

                                            {requiredRequirements.map((requirement) => (
                                                <RequirementRow
                                                    key={requirement.id}
                                                    requirement={requirement}
                                                    t={t}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {preferredRequirements.length > 0 && (
                                        <div>
                                            <h3>{t('recruiterJobs.preferredSkills')}</h3>

                                            {preferredRequirements.map((requirement) => (
                                                <RequirementRow
                                                    key={requirement.id}
                                                    requirement={requirement}
                                                    t={t}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {activeTab === 'matching' && (
                    <section className="recruiter-job-details-card recruiter-matches-section">
                        <div className="recruiter-job-details-section-header recruiter-matches-section__header">
                            <div>
                                <h2>{t('recruiterMatches.title')}</h2>
                                <p>{t('recruiterMatches.description')}</p>
                            </div>
                        </div>

                        {job.status !== 'PUBLISHED' && (
                            <p className="recruiter-job-details-muted">
                                {t('recruiterMatches.onlyPublished')}
                            </p>
                        )}

                        {job.status === 'PUBLISHED' && (
                            <>
                                <div className="recruiter-matches-overview">
                                    <div className="recruiter-matches-stat">
                                        <span>
                                            {t('recruiterMatches.candidatesOnThisPage')}
                                        </span>
                                        <strong>{candidateMatches.length}</strong>
                                    </div>

                                    <div className="recruiter-matches-stat recruiter-matches-stat--success">
                                        <span>
                                            {t('recruiterMatches.strongMatchesOnThisPage')}
                                        </span>
                                        <strong>{strongMatchesOnPage}</strong>
                                    </div>

                                    {matchesMeta && (
                                        <div className="recruiter-matches-stat">
                                            <span>
                                                {t('recruiterMatches.totalFound')}
                                            </span>
                                            <strong>{matchesMeta.total}</strong>
                                        </div>
                                    )}
                                </div>

                                {matchesLoading && (
                                    <p
                                        role="status"
                                        className="recruiter-job-details-muted recruiter-matches-feedback"
                                    >
                                        {t('recruiterMatches.loading')}
                                    </p>
                                )}

                                {!matchesLoading && matchesError && (
                                    <div role="alert" className="recruiter-job-details-state">
                                        <p>{t('recruiterMatches.loadError')}</p>

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => setMatchesRetry((value) => value + 1)}
                                        >
                                            {t('common.tryAgain')}
                                        </button>
                                    </div>
                                )}

                                {!matchesLoading && !matchesError && (
                                    <>
                                        <div className="recruiter-matches-toolbar">
                                            <div
                                                className="recruiter-matches-filters"
                                                role="group"
                                                aria-label={t('recruiterMatches.filterCandidatesByScore')}
                                            >
                                                {(
                                                    ['all', 'strong', 'partial', 'none'] as const
                                                ).map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className={`recruiter-matches-filter${matchesFilter === value ? ' is-active' : ''}`}
                                                        aria-pressed={matchesFilter === value}
                                                        onClick={() => {
                                                            setMatchesFilter(value)
                                                            setMatchesPage(1)
                                                            setExpandedMatchId(null)
                                                        }}
                                                    >
                                                        {matchFilterLabels[value]}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                className="recruiter-matches-sort"
                                                onClick={() =>
                                                    setMatchesSort((value) =>
                                                        value === 'desc' ? 'asc' : 'desc',
                                                    )
                                                }
                                            >
                                                <span>{t('recruiterMatches.matchScore')}</span>
                                                <span aria-hidden="true">
                                                    {matchesSort === 'desc' ? '↓' : '↑'}
                                                </span>
                                                <span className="sr-only">
                                                    {matchesSort === 'desc'
                                                        ? t('recruiterMatches.highestFirst')
                                                        : t('recruiterMatches.lowestFirst')}
                                                </span>
                                            </button>
                                        </div>

                                        <p className="recruiter-matches-result-count">
                                            {candidateMatches.length}{' '}
                                            {t('recruiterMatches.candidatesOf')}{' '}
                                            {matchesMeta?.total ?? 0}{' '}
                                            {t('recruiterMatches.candidatesFound')}
                                        </p>

                                        {visibleCandidateMatches.length > 0 ? (
                                            <div className="recruiter-matches-list">
                                                {visibleCandidateMatches.map((match) => {
                                                    const score = Math.max(
                                                        0,
                                                        Math.min(
                                                            100,
                                                            Math.round(
                                                                Number(match.overallScore) || 0,
                                                            ),
                                                        ),
                                                    )

                                                    const isExpanded =
                                                        expandedMatchId === match.id

                                                    return (
                                                        <article
                                                            className="recruiter-match-card"
                                                            key={match.id}
                                                        >
                                                            <div className="recruiter-match-card__header">
                                                                <div className="recruiter-match-candidate">
                                                                    <h3>
                                                                        {match.candidate.user.firstName}{' '}
                                                                        {match.candidate.user.lastName}
                                                                    </h3>

                                                                    {match.candidate.headline && (
                                                                        <p>{match.candidate.headline}</p>
                                                                    )}

                                                                    {match.candidate.location && (
                                                                        <p className="recruiter-match-location">
                                                                            {match.candidate.location}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div
                                                                    className={`recruiter-match-score${score >= 80
                                                                        ? ' recruiter-match-score--strong'
                                                                        : score > 0
                                                                            ? ' recruiter-match-score--partial'
                                                                            : ''
                                                                        }`}
                                                                >
                                                                    <strong>{score}%</strong>
                                                                    <span>
                                                                        {t('recruiterMatches.matchScore')}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div
                                                                className={`recruiter-match-progress${score >= 80
                                                                    ? ' recruiter-match-progress--strong'
                                                                    : ''
                                                                    }`}
                                                                role="progressbar"
                                                                aria-label={`${score}% ${t('recruiterMatches.matchScore')}`}
                                                                aria-valuenow={score}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                            >
                                                                <span style={{ width: `${score}%` }} />
                                                            </div>

                                                            <div className="recruiter-match-card__footer">
                                                                <span
                                                                    className={`recruiter-match-label${score >= 80
                                                                        ? ' is-strong'
                                                                        : score > 0
                                                                            ? ' is-partial'
                                                                            : ''
                                                                        }`}
                                                                >
                                                                    {score >= 80
                                                                        ? t('recruiterMatches.strongMatch')
                                                                        : score > 0
                                                                            ? t('recruiterMatches.partialMatch')
                                                                            : t('recruiterMatches.noMatch')}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    className="recruiter-match-details-toggle"
                                                                    aria-expanded={isExpanded}
                                                                    onClick={() =>
                                                                        setExpandedMatchId(
                                                                            isExpanded ? null : match.id,
                                                                        )
                                                                    }
                                                                >
                                                                    {isExpanded
                                                                        ? t('recruiterMatches.hideDetails')
                                                                        : t('recruiterMatches.viewDetails')}
                                                                    <span aria-hidden="true">
                                                                        {isExpanded ? '−' : '+'}
                                                                    </span>
                                                                </button>
                                                            </div>

                                                            {isExpanded && (
                                                                <div className="recruiter-match-details">
                                                                    {match.candidate.candidateSkills.length > 0 && (
                                                                        <div className="recruiter-match-skills">
                                                                            <strong>
                                                                                {t('recruiterMatches.skills')}
                                                                            </strong>

                                                                            <ul>
                                                                                {match.candidate.candidateSkills.map(
                                                                                    (candidateSkill) => (
                                                                                        <li key={candidateSkill.id}>
                                                                                            <span>
                                                                                                {candidateSkill.skill.name}
                                                                                            </span>
                                                                                            <span>
                                                                                                {t('recruiterMatches.level')}{' '}
                                                                                                {candidateSkill.proficiencyLevel}
                                                                                            </span>
                                                                                        </li>
                                                                                    ),
                                                                                )}
                                                                            </ul>
                                                                        </div>
                                                                    )}

                                                                    {match.explanation?.gaps &&
                                                                        match.explanation.gaps.length > 0 && (
                                                                            <div className="recruiter-match-gaps">
                                                                                <strong>
                                                                                    {t('recruiterMatches.skillGaps')}
                                                                                </strong>

                                                                                <ul>
                                                                                    {match.explanation.gaps.map((gap) => (
                                                                                        <li key={gap.skill}>
                                                                                            <span>{gap.skill}</span>
                                                                                            <span>
                                                                                                {t('recruiterMatches.requiredLevel')}{' '}
                                                                                                {gap.requiredLevel}
                                                                                            </span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                    {match.candidate.candidateSkills.length === 0 &&
                                                                        (!match.explanation?.gaps ||
                                                                            match.explanation.gaps.length === 0) && (
                                                                            <p className="recruiter-job-details-muted">
                                                                                {t('recruiterMatches.noSkillDetails')}
                                                                            </p>
                                                                        )}
                                                                </div>
                                                            )}
                                                        </article>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <p className="recruiter-job-details-muted recruiter-matches-no-filter-results">
                                                {matchesMeta?.total === 0
                                                    ? t('recruiterMatches.empty')
                                                    : t('recruiterMatches.noCandidatesForFilter')}
                                            </p>
                                        )}
                                    </>
                                )}

                                {matchesMeta &&
                                    matchesMeta.total > matchesMeta.limit && (
                                        <Pagination
                                            currentPage={matchesPage}
                                            totalItems={matchesMeta.total}
                                            itemsPerPage={matchesMeta.limit}
                                            onPageChange={(page) => {
                                                setMatchesPage(page)
                                                setExpandedMatchId(null)
                                            }}
                                        />
                                    )}
                            </>
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}
