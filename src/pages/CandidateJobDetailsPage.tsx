import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCandidateJobById } from '../features/jobs/jobs.api'
import { ApiError } from '../services/api/apiError'
import {
    EMPLOYMENT_TYPE_TRANSLATION_KEYS,
    LOCALES,
    WORK_MODE_TRANSLATION_KEYS,
} from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import {
    type CandidateJob,
    type EmploymentType,
    type WorkMode,
} from '../types/job'
import './CandidateJobDetailsPage.css'

function formatSalary(
    salaryMin: string | number | null,
    salaryMax: string | number | null,
    currency: string | null,
    locale: string,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    if (salaryMin === null && salaryMax === null) {
        return t('common.notSpecified')
    }

    const formatAmount = (value: string | number): string => {
        const amount = Number(value)

        if (Number.isNaN(amount)) {
            return String(value)
        }

        return new Intl.NumberFormat(locale, {
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const currencyLabel = currency ? ` ${currency}` : ''

    if (salaryMin !== null && salaryMax !== null) {
        return `${formatAmount(salaryMin)} - ${formatAmount(salaryMax)}${currencyLabel}`
    }

    if (salaryMin !== null) {
        return `${t('common.from')} ${formatAmount(salaryMin)}${currencyLabel}`
    }

    return `${t('common.upTo')} ${formatAmount(salaryMax!)}${currencyLabel}`
}

function formatDate(
    value: string | null,
    locale: string,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    if (!value) {
        return t('common.notSpecified')
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'long',
    }).format(new Date(value))
}

function CandidateJobDetailsPage() {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { language, t } = useTranslation()

    const [job, setJob] = useState<CandidateJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const locale = LOCALES[language]

    const employmentTypeLabel = (value: EmploymentType) =>
        t(EMPLOYMENT_TYPE_TRANSLATION_KEYS[value])

    const workModeLabel = (value: WorkMode) =>
        t(WORK_MODE_TRANSLATION_KEYS[value])

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
                    {t('candidateJobDetails.loading')}
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
                            ? t('candidateJobDetails.jobNotFound')
                            : t('candidateJobDetails.unableToLoad')}
                    </h1>

                    <p>
                        {notFound
                            ? t('candidateJobDetails.jobUnavailable')
                            : t('candidateJobDetails.loadError')}
                    </p>

                    <div className="candidate-job-details-actions">
                        {!notFound && (
                            <button
                                type="button"
                                onClick={() =>
                                    setRetryCount((current) => current + 1)
                                }
                            >
                                {t('common.tryAgain')}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => navigate('/jobs')}
                        >
                            {t('candidateJobDetails.backToJobs')}
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

    const sanitizedDescription = DOMPurify.sanitize(job.description)

    return (
        <section className="candidate-job-details-page">
            <Link
                to="/jobs"
                className="candidate-job-details-back"
            >
                ← {t('candidateJobDetails.backToJobs')}
            </Link>

            <article className="candidate-job-details">
                <header className="candidate-job-details-header">
                    <div>
                        <p className="candidate-job-details-eyebrow">
                            {t('candidateJobDetails.jobOpportunity')}
                        </p>

                        <h1>{job.title}</h1>

                        <p className="candidate-job-details-company">
                            {job.company.name}
                        </p>
                    </div>

                    <Link
                        to={`/jobs/${jobId}/apply`}
                        className="candidate-job-application-button"
                    >
                        {t('candidateJobDetails.applyForThisJob')}
                    </Link>
                </header>

                <div className="candidate-job-details-meta">
                    {job.location && (
                        <div>
                            <dt>{t('common.location')}</dt>
                            <dd>{job.location}</dd>
                        </div>
                    )}

                    <div>
                        <dt>{t('common.workMode')}</dt>
                        <dd>{workModeLabel(job.workMode)}</dd>
                    </div>

                    <div>
                        <dt>{t('common.employmentType')}</dt>
                        <dd>{employmentTypeLabel(job.employmentType)}</dd>
                    </div>

                    <div>
                        <dt>{t('common.salary')}</dt>
                        <dd>
                            {formatSalary(
                                job.salaryMin,
                                job.salaryMax,
                                job.currency,
                                locale,
                                t,
                            )}
                        </dd>
                    </div>
                </div>

                <section className="candidate-job-details-section">
                    <h2>{t('candidateJobDetails.aboutTheJob')}</h2>

                    <div
                        className="candidate-job-description"
                        dangerouslySetInnerHTML={{
                            __html: sanitizedDescription,
                        }}
                    />
                </section>

                {requiredSkills.length > 0 && (
                    <section className="candidate-job-details-section">
                        <h2>{t('candidateJobDetails.requiredSkills')}</h2>

                        <ul className="candidate-job-skill-list">
                            {requiredSkills.map((requirement) => (
                                <li key={requirement.id}>
                                    <strong>
                                        {requirement.skill.name}
                                    </strong>

                                    <span>
                                        {t('common.minimumLevel')}:{' '}
                                        {requirement.minimumLevel}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {preferredSkills.length > 0 && (
                    <section className="candidate-job-details-section">
                        <h2>{t('candidateJobDetails.preferredSkills')}</h2>

                        <ul className="candidate-job-skill-list">
                            {preferredSkills.map((requirement) => (
                                <li key={requirement.id}>
                                    <strong>
                                        {requirement.skill.name}
                                    </strong>

                                    <span>
                                        {t('common.minimumLevel')}:{' '}
                                        {requirement.minimumLevel}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="candidate-job-details-section candidate-job-application-section">
                    <h2>{t('candidateJobDetails.applyForThisJob')}</h2>

                    <Link
                        to={`/jobs/${jobId}/apply`}
                        className="candidate-job-application-button"
                    >
                        {t('candidateJobDetails.applyNow')}
                    </Link>
                </section>

                <section className="candidate-job-details-section candidate-job-company-section">
                    <h2>{t('candidateJobDetails.company')}</h2>

                    <dl className="candidate-job-company-details">
                        <div>
                            <dt>{t('common.name')}</dt>
                            <dd>{job.company.name}</dd>
                        </div>

                        {job.company.location && (
                            <div>
                                <dt>{t('common.location')}</dt>
                                <dd>{job.company.location}</dd>
                            </div>
                        )}

                        {job.company.website && (
                            <div>
                                <dt>{t('candidateJobDetails.website')}</dt>
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
                        <strong>
                            {t('common.published')}
                        </strong>

                        <span>
                            {formatDate(
                                job.publishedAt,
                                locale,
                                t,
                            )}
                        </span>
                    </div>

                    <div>
                        <strong>
                            {t('candidateJobDetails.expires')}
                        </strong>

                        <span>
                            {formatDate(
                                job.expiresAt,
                                locale,
                                t,
                            )}
                        </span>
                    </div>
                </footer>
            </article>
        </section>
    )
}

export default CandidateJobDetailsPage
