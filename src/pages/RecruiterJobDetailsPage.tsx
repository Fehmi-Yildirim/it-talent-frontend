import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    closeJob,
    getJobById,
    publishJob,
} from '../features/jobs/jobs.api'
import { useTranslation } from '../i18n/context'
import type { Job, JobRequirement } from '../types/job'
import './RecruiterJobDetailsPage.css'

function formatEmploymentType(
    value: Job['employmentType'],
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (value) {
        case 'FULL_TIME':
            return t('recruiterJobs.fullTime')
        case 'PART_TIME':
            return t('recruiterJobs.partTime')
        case 'CONTRACT':
            return t('recruiterJobs.contract')
        case 'FREELANCE':
            return t('recruiterJobs.freelance')
        case 'INTERNSHIP':
            return t('recruiterJobs.internship')
        default:
            return value
    }
}

function formatWorkMode(
    value: Job['workMode'],
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (value) {
        case 'REMOTE':
            return t('recruiterJobs.remote')
        case 'HYBRID':
            return t('recruiterJobs.hybrid')
        case 'ONSITE':
            return t('recruiterJobs.onsite')
        case 'FLEXIBLE':
            return t('recruiterJobs.flexible')
        default:
            return value
    }
}

function formatStatus(
    value: Job['status'],
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (value) {
        case 'DRAFT':
            return t('recruiterJobs.draft')
        case 'PUBLISHED':
            return t('recruiterJobs.published')
        case 'CLOSED':
            return t('recruiterJobs.closed')
        default:
            return value
    }
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

    const symbol = currency ? `${currency} ` : ''

    if (salaryMin !== null && salaryMax !== null) {
        return `${symbol}${salaryMin} - ${salaryMax}`
    }

    if (salaryMin !== null) {
        return `${symbol}${salaryMin}+`
    }

    return `${t('recruiterJobs.upTo')} ${symbol}${salaryMax}`
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

    const locale = language === 'nl' ? 'nl-NL' : 'en-US'

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
            setSuccess(t('recruiterJobs.publishedSuccessfully'))
        } catch {
            setError(t('recruiterJobs.publishError'))
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
            setSuccess(t('recruiterJobs.closedSuccessfully'))
        } catch {
            setError(t('recruiterJobs.closeError'))
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
                        ← {t('recruiterJobs.backToJobs')}
                    </Link>

                    <h1>{job.title}</h1>

                    <div className="recruiter-job-details-meta">
                        <span
                            className={`recruiter-job-details-status recruiter-job-details-status-${job.status.toLowerCase()}`}
                        >
                            {formatStatus(job.status, t)}
                        </span>

                        <span>
                            {formatEmploymentType(
                                job.employmentType,
                                t,
                            )}
                        </span>

                        <span>
                            {formatWorkMode(job.workMode, t)}
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
                        <Link
                            className="recruiter-job-details-secondary-button"
                            to={`/recruiter/jobs/${job.id}/edit`}
                        >
                            {t('recruiterJobs.edit')}
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
                    <h2>{t('recruiterJobs.jobDescription')}</h2>

                    <p className="recruiter-job-details-description">
                        {job.description}
                    </p>
                </section>

                <section className="recruiter-job-details-card">
                    <h2>{t('recruiterJobs.jobInformation')}</h2>

                    <dl className="recruiter-job-details-list">
                        <div>
                            <dt>{t('recruiterJobs.employmentType')}</dt>
                            <dd>
                                {formatEmploymentType(
                                    job.employmentType,
                                    t,
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt>{t('recruiterJobs.workMode')}</dt>
                            <dd>
                                {formatWorkMode(job.workMode, t)}
                            </dd>
                        </div>

                        <div>
                            <dt>{t('recruiterJobs.locationNotSpecified')}</dt>
                            <dd>
                                {job.location ||
                                    t('recruiterJobs.locationNotSpecified')}
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

                    {job.requirements.length === 0 ? (
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