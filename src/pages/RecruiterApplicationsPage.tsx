import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecruiterApplications } from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import { LOCALES } from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import {
    APPLICATION_STATUSES,
    type ApplicationStatus,
    type RecruiterApplication,
} from '../types/application'
import './RecruiterApplicationsPage.css'
import Pagination from '../components/Pagination/Pagination'

const PAGE_SIZE = 10

function formatStatus(
    status: ApplicationStatus,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (status) {
        case APPLICATION_STATUSES.PENDING:
            return t('common.pending')
        case APPLICATION_STATUSES.REVIEWING:
            return t('common.reviewing')
        case APPLICATION_STATUSES.ACCEPTED:
            return t('common.accepted')
        case APPLICATION_STATUSES.REJECTED:
            return t('common.rejected')
        case APPLICATION_STATUSES.WITHDRAWN:
            return t('common.withdrawn')
        default:
            return status
    }
}

function formatDate(value: string, locale: string): string {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

function getCandidateName(application: RecruiterApplication): string {
    const { candidate } = application

    return (
        [candidate.firstName, candidate.lastName]
            .filter(Boolean)
            .join(' ') ||
        candidate.email
    )
}

function RecruiterApplicationsPage() {
    const { language, t } = useTranslation()
    const [applications, setApplications] = useState<RecruiterApplication[]>([])
    const [selectedJob, setSelectedJob] = useState('')
    const [selectedStatus, setSelectedStatus] =
        useState<ApplicationStatus | ''>('')
    const [loading, setLoading] = useState(true)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const locale = LOCALES[language]
    const [currentPage, setCurrentPage] = useState(1)

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
                    setErrorStatus(caught instanceof ApiError ? caught.status : 500)
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
            uniqueJobs.set(application.job.id, application.job.title)
        }

        return Array.from(uniqueJobs.entries()).sort((a, b) =>
            a[1].localeCompare(b[1], locale),
        )
    }, [applications, locale])

    const filteredApplications = useMemo(
        () =>
            applications.filter((application) => {
                const matchesJob =
                    selectedJob === '' || application.job.id === selectedJob
                const matchesStatus =
                    selectedStatus === '' || application.status === selectedStatus

                return matchesJob && matchesStatus
            }),
        [applications, selectedJob, selectedStatus],
    )

    const paginatedApplications = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE

        return filteredApplications.slice(
            startIndex,
            startIndex + PAGE_SIZE,
        )
    }, [filteredApplications, currentPage])

    const hasActiveFilters = selectedJob !== '' || selectedStatus !== ''

    function resetFilters() {
        setSelectedJob('')
        setSelectedStatus('')
        setCurrentPage(1)
    }

    if (loading) {
        return (
            <section className="recruiter-applications-page">
                <section
                    className="recruiter-applications-state"
                    role="status"
                    aria-live="polite"
                >
                    <span className="recruiter-applications-state-spinner" aria-hidden="true" />
                    <h2>{t('recruiterApplications.loading')}</h2>
                </section>
            </section>
        )
    }

    if (errorStatus !== null) {
        const isAccessDenied = errorStatus === 401 || errorStatus === 403

        return (
            <section className="recruiter-applications-page">
                <section
                    className="recruiter-applications-state recruiter-applications-error"
                    role="alert"
                >
                    <h1>
                        {isAccessDenied
                            ? t('recruiterApplications.accessDenied')
                            : t('recruiterApplications.unableToLoad')}
                    </h1>
                    <p>
                        {isAccessDenied
                            ? t('recruiterApplications.unauthorized')
                            : t('recruiterApplications.loadError')}
                    </p>
                </section>
            </section>
        )
    }

    return (
        <section className="recruiter-applications-page">
            <header className="recruiter-applications-header">
                <div>
                    <p className="recruiter-applications-eyebrow">
                        {t('recruiterApplications.filters')}
                    </p>
                    <h1>{t('recruiterApplications.title')}</h1>
                    <p className="recruiter-applications-description">
                        {t('recruiterApplications.description')}
                    </p>
                </div>

                <div className="recruiter-applications-total" aria-live="polite">
                    <strong>{filteredApplications.length}</strong>
                    <span>
                        / {applications.length}
                    </span>
                </div>
            </header>

            <section
                className="recruiter-applications-filters"
                aria-label={t('recruiterApplications.filters')}
            >
                <label className="recruiter-applications-filter">
                    <span>{t('recruiterApplications.job')}</span>
                    <select
                        value={selectedJob}
                        onChange={(event) => setSelectedJob(event.target.value)}
                    >
                        <option value="">{t('recruiterApplications.allJobs')}</option>
                        {jobs.map(([jobId, jobTitle]) => (
                            <option key={jobId} value={jobId}>
                                {jobTitle}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="recruiter-applications-filter">
                    <span>{t('common.status')}</span>
                    <select
                        value={selectedStatus}
                        onChange={(event) => {
                            setSelectedStatus(
                                event.target.value as ApplicationStatus | '',
                            )
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">
                            {t('recruiterApplications.allStatuses')}
                        </option>
                        <option value={APPLICATION_STATUSES.PENDING}>
                            {t('common.pending')}
                        </option>
                        <option value={APPLICATION_STATUSES.REVIEWING}>
                            {t('common.reviewing')}
                        </option>
                        <option value={APPLICATION_STATUSES.ACCEPTED}>
                            {t('common.accepted')}
                        </option>
                        <option value={APPLICATION_STATUSES.REJECTED}>
                            {t('common.rejected')}
                        </option>
                        <option value={APPLICATION_STATUSES.WITHDRAWN}>
                            {t('common.withdrawn')}
                        </option>
                    </select>
                </label>

                <button
                    className="recruiter-applications-reset"
                    type="button"
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    aria-label={t('recruiterApplications.filters')}
                >
                    ×
                </button>
            </section>

            {filteredApplications.length === 0 ? (
                <section className="recruiter-applications-state">
                    <div className="recruiter-applications-empty-icon" aria-hidden="true">
                        {applications.length === 0 ? '◎' : '⌕'}
                    </div>
                    <h2>{t('recruiterApplications.noApplications')}</h2>
                    <p>{t('recruiterApplications.noApplicationsMatch')}</p>
                    {hasActiveFilters && (
                        <button
                            className="recruiter-applications-secondary-button"
                            type="button"
                            onClick={resetFilters}
                        >
                            {t('recruiterApplications.allStatuses')}
                        </button>
                    )}
                </section>
            ) : (
                <>
                    <div className="recruiter-applications-list">
                        {paginatedApplications.map((application) => {
                            const candidateName = getCandidateName(application)
                            const initials = candidateName
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part.charAt(0).toLocaleUpperCase(locale))
                                .join('')

                            return (
                                <article
                                    key={application.id}
                                    className="recruiter-application-card"
                                >
                                    <div className="recruiter-application-main">
                                        <div
                                            className="recruiter-application-avatar"
                                            aria-hidden="true"
                                        >
                                            <span>{initials || '?'}</span>
                                        </div>

                                        <div className="recruiter-application-info">
                                            <Link
                                                to={`/recruiter/applications/${application.id}`}
                                                className="recruiter-application-title"
                                            >
                                                {candidateName}
                                            </Link>
                                            <p className="recruiter-application-job">
                                                {application.job.title}
                                            </p>
                                            {application.candidate.headline && (
                                                <p className="recruiter-application-candidate-meta">
                                                    {application.candidate.headline}
                                                </p>
                                            )}
                                            <p className="recruiter-application-candidate-meta">
                                                {application.candidate.email}
                                                {application.candidate.location && (
                                                    <> · {application.candidate.location}</>
                                                )}
                                            </p>
                                            <p className="recruiter-application-date">
                                                {formatDate(application.createdAt, locale)}
                                            </p>
                                        </div>

                                        <span
                                            className={`recruiter-application-status recruiter-application-status--${application.status.toLowerCase()}`}
                                        >
                                            {formatStatus(application.status, t)}
                                        </span>
                                    </div>

                                    <div className="recruiter-application-footer">
                                        <span className="recruiter-application-cover-letter">
                                            <span aria-hidden="true">
                                                {application.coverLetter ? '✓' : '—'}
                                            </span>
                                            {t('recruiterApplications.coverLetterIncluded')}
                                        </span>
                                        <Link
                                            to={`/recruiter/applications/${application.id}`}
                                            className="recruiter-application-view-link"
                                        >
                                            {t('recruiterApplications.viewDetails')}
                                            <span aria-hidden="true"> →</span>
                                        </Link>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredApplications.length}
                        itemsPerPage={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                    /></>
            )}
        </section>
    )
}

export default RecruiterApplicationsPage
