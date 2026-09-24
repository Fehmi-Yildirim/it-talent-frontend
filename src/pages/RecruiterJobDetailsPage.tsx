import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    closeJob,
    getJobById,
    pauseJob,
    publishJob,
    reopenJob,
    resumeJob,
} from '../features/jobs/jobs.api'
import {
    EMPLOYMENT_TYPE_TRANSLATION_KEYS,
    LOCALES,
    WORK_MODE_TRANSLATION_KEYS,
} from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import type { Job, JobRequirement } from '../types/job'
import './RecruiterJobDetailsPage.css'

function formatSalaryValue(
    value: string | number,
    currency: string,
): string {
    const amount =
        typeof value === 'number'
            ? value
            : Number(value)

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
        return `${formatSalaryValue(
            salaryMin,
            currencyCode,
        )}+`
    }

    return `${t('recruiterJobs.upTo')} ${formatSalaryValue(
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
                        ? t('recruiterJobs.required')
                        : t('recruiterJobs.preferred')}
                </span>
            </div>

            <span>
                {t('recruiterJobs.minimumLevel')}:{' '}
                {requirement.minimumLevel}
            </span>
        </div>
    )
}

export default function RecruiterJobDetailsPage() {
    const navigate = useNavigate()
    const { jobId } = useParams()
    const { language, t } = useTranslation()

    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

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
                return t('recruiterJobs.draft')
            case 'PUBLISHED':
                return t('recruiterJobs.published')
            case 'PAUSED':
                return t('recruiterJobs.paused')
            case 'CLOSED':
                return t('recruiterJobs.closed')
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

    async function refreshJob() {
        if (!jobId) {
            return
        }

        const response = await getJobById(jobId)
        setJob(response)
    }

    async function handlePublish() {
        if (!jobId || !job || actionLoading) {
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
        if (!jobId || !job || actionLoading) {
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
        if (!jobId || !job || actionLoading) {
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
        if (!jobId || !job || actionLoading) {
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
        if (!jobId || !job || actionLoading) {
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

    if (loading) {
        return (
            <main className="recruiter-job-details-page">
                <div
                    className="recruiter-job-details-state"
                    role="status"
                >
                    {t('recruiterJobForm.loading')}
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
                        {t('recruiterJobs.backToJobs')}
                    </Link>
                </div>
            </main>
        )
    }

    if (!job) {
        return (
            <main className="recruiter-job-details-page">
                <div className="recruiter-job-details-state">
                    {t('recruiterJobs.jobNotFound')}
                </div>
            </main>
        )
    }

    const requirements = job.requirements ?? []

    const requiredRequirements = requirements.filter(
        (requirement) => requirement.required,
    )

    const preferredRequirements = requirements.filter(
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
                        ← {t('recruiterJobs.backToJobs')}
                    </Link>

                    <h1>{job.title}</h1>

                    <div className="recruiter-job-details-meta">
                        <span
                            className={`recruiter-job-details-status recruiter-job-details-status-${job.status.toLowerCase()}`}
                        >
                            {formatStatus(job.status)}
                        </span>

                        <span>
                            {formatEmploymentType(
                                job.employmentType,
                            )}
                        </span>

                        <span>
                            {formatWorkMode(job.workMode)}
                        </span>

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
                                {t('recruiterJobs.edit')}
                            </Link>

                            <button
                                className="recruiter-job-details-primary-button"
                                type="button"
                                onClick={() => void handlePublish()}
                                disabled={actionLoading}
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
                                className="recruiter-job-details-secondary-button"
                                to={`/recruiter/jobs/${job.id}/edit`}
                            >
                                {t('recruiterJobs.edit')}
                            </Link>

                            <button
                                className="recruiter-job-details-secondary-button"
                                type="button"
                                onClick={() => void handlePause()}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.pausing')
                                    : t('recruiterJobs.pause')}
                            </button>

                            <button
                                className="recruiter-job-details-danger-button"
                                type="button"
                                onClick={() => void handleClose()}
                                disabled={actionLoading}
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
                                className="recruiter-job-details-secondary-button"
                                to={`/recruiter/jobs/${job.id}/edit`}
                            >
                                {t('recruiterJobs.edit')}
                            </Link>

                            <button
                                className="recruiter-job-details-primary-button"
                                type="button"
                                onClick={() => void handleResume()}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? t('recruiterJobs.resuming')
                                    : t('recruiterJobs.resume')}
                            </button>

                            <button
                                className="recruiter-job-details-danger-button"
                                type="button"
                                onClick={() => void handleClose()}
                                disabled={actionLoading}
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
                                className="recruiter-job-details-secondary-button"
                                to={`/recruiter/jobs/${job.id}/edit`}
                            >
                                {t('recruiterJobs.edit')}
                            </Link>

                            <button
                                className="recruiter-job-details-primary-button"
                                type="button"
                                onClick={() => void handleReopen()}
                                disabled={actionLoading}
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
                    <h2>{t('recruiterJobs.jobDescription')}</h2>

                    <div
                        className="recruiter-job-details-description"
                        dangerouslySetInnerHTML={{
                            __html: job.description,
                        }}
                    />
                </section>

                <section className="recruiter-job-details-card">
                    <h2>{t('recruiterJobs.jobInformation')}</h2>

                    <dl className="recruiter-job-details-list">
                        <div>
                            <dt>{t('recruiterJobs.employmentType')}</dt>
                            <dd>
                                {formatEmploymentType(
                                    job.employmentType,
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt>{t('recruiterJobs.workMode')}</dt>
                            <dd>
                                {formatWorkMode(job.workMode)}
                            </dd>
                        </div>

                        <div>
                            <dt>{t('recruiterJobs.locationNotSpecified')}</dt>
                            <dd>
                                {job.location ||
                                    t(
                                        'recruiterJobs.locationNotSpecified',
                                    )}
                            </dd>
                        </div>

                        <div>
                            <dt>{t('recruiterJobs.salary')}</dt>
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
                            <dd>
                                {formatDate(
                                    job.expiresAt,
                                    locale,
                                    t,
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt>{t('recruiterJobs.published')}</dt>
                            <dd>
                                {formatDate(
                                    job.publishedAt,
                                    locale,
                                    t,
                                )}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="recruiter-job-details-card">
                    <div className="recruiter-job-details-section-header">
                        <div>
                            <h2>{t('recruiterJobs.requirements')}</h2>

                            <p>
                                {t(
                                    'recruiterJobs.requirementsDescription',
                                )}
                            </p>
                        </div>

                        <Link
                            className="recruiter-job-details-secondary-button"
                            to={`/recruiter/jobs/${job.id}/edit`}
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
                                    <h3>
                                        {t(
                                            'recruiterJobs.requiredSkills',
                                        )}
                                    </h3>

                                    {requiredRequirements.map(
                                        (requirement) => (
                                            <RequirementRow
                                                key={requirement.id}
                                                requirement={requirement}
                                                t={t}
                                            />
                                        ),
                                    )}
                                </div>
                            )}

                            {preferredRequirements.length > 0 && (
                                <div>
                                    <h3>
                                        {t(
                                            'recruiterJobs.preferredSkills',
                                        )}
                                    </h3>

                                    {preferredRequirements.map(
                                        (requirement) => (
                                            <RequirementRow
                                                key={requirement.id}
                                                requirement={requirement}
                                                t={t}
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
                    {t('recruiterJobs.backToJobs')}
                </button>
            </footer>
        </main>
    )
}
