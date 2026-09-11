import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createApplication } from '../features/applications/applications.api'
import { getCandidateJobById } from '../features/jobs/jobs.api'
import { ApiError } from '../services/api/apiError'
import { useTranslation } from '../i18n/useTranslation'
import type { CandidateJob } from '../types/job'
import './CandidateJobDetailsPage.css'

function formatSalary(
    salaryMin: string | number | null,
    salaryMax: string | number | null,
    currency: string | null,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    if (salaryMin === null && salaryMax === null) {
        return t('candidateJobDetails.notSpecified')
    }

    const currencyLabel = currency ? ` ${currency} ` : ''

    if (salaryMin !== null && salaryMax !== null) {
        return `${salaryMin} - ${salaryMax}${currencyLabel}`
    }

    if (salaryMin !== null) {
        return `${t('candidateJobDetails.from')} ${salaryMin}${currencyLabel}`
    }

    return `${t('candidateJobDetails.upTo')} ${salaryMax}${currencyLabel}`
}

function formatDate(
    value: string | null,
    locale: string,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    if (!value) {
        return t('candidateJobDetails.notSpecified')
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

    const [coverLetter, setCoverLetter] = useState('')
    const [isSubmittingApplication, setIsSubmittingApplication] =
        useState(false)
    const [applicationSubmitted, setApplicationSubmitted] = useState(false)
    const [applicationAlreadyExists, setApplicationAlreadyExists] =
        useState(false)
    const [applicationError, setApplicationError] = useState<string | null>(
        null,
    )

    const locale = language === 'nl' ? 'nl-NL' : 'en-US'

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

    async function handleApply() {
        if (!jobId || isSubmittingApplication || applicationSubmitted) {
            return
        }

        setIsSubmittingApplication(true)
        setApplicationError(null)
        setApplicationAlreadyExists(false)

        try {
            await createApplication(jobId, {
                coverLetter: coverLetter.trim() || undefined,
            })

            setApplicationSubmitted(true)
            setCoverLetter('')
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 409) {
                setApplicationAlreadyExists(true)
            } else if (caught instanceof ApiError) {
                setApplicationError(
                    t('candidateJobDetails.submitError'),
                )
            } else {
                setApplicationError(
                    t('candidateJobDetails.submitUnexpectedError'),
                )
            }
        } finally {
            setIsSubmittingApplication(false)
        }
    }

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
                                {t('candidateJobDetails.tryAgain')}
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
                </header>

                <div className="candidate-job-details-meta">
                    {job.location && (
                        <div>
                            <dt>{t('candidateJobDetails.location')}</dt>
                            <dd>{job.location}</dd>
                        </div>
                    )}

                    <div>
                        <dt>{t('candidateJobDetails.workMode')}</dt>
                        <dd>{job.workMode}</dd>
                    </div>

                    <div>
                        <dt>{t('candidateJobDetails.employmentType')}</dt>
                        <dd>{job.employmentType}</dd>
                    </div>

                    <div>
                        <dt>{t('candidateJobDetails.salary')}</dt>
                        <dd>
                            {formatSalary(
                                job.salaryMin,
                                job.salaryMax,
                                job.currency,
                                t,
                            )}
                        </dd>
                    </div>
                </div>

                <section className="candidate-job-details-section">
                    <h2>{t('candidateJobDetails.aboutTheJob')}</h2>

                    <div className="candidate-job-description">
                        {job.description
                            .split('\n')
                            .map((paragraph, index) => (
                                <p key={`${index}-${paragraph}`}>
                                    {paragraph}
                                </p>
                            ))}
                    </div>
                </section>

                <section className="candidate-job-details-section candidate-job-application-section">
                    <h2>{t('candidateJobDetails.applyForThisJob')}</h2>

                    {applicationSubmitted ? (
                        <div
                            className="candidate-job-application-success"
                            role="status"
                            aria-live="polite"
                        >
                            <strong>
                                {t('candidateJobDetails.applicationSubmitted')}
                            </strong>

                            <p>
                                {t('candidateJobDetails.applicationSuccess')}
                            </p>

                            <Link to="/applications">
                                {t('candidateJobDetails.viewMyApplications')}
                            </Link>
                        </div>
                    ) : applicationAlreadyExists ? (
                        <div
                            className="candidate-job-application-success"
                            role="status"
                            aria-live="polite"
                        >
                            <strong>
                                {t('candidateJobDetails.alreadyApplied')}
                            </strong>

                            <p>
                                {t(
                                    'candidateJobDetails.alreadyAppliedDescription',
                                )}
                            </p>

                            <Link to="/applications">
                                {t('candidateJobDetails.viewMyApplications')}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p>
                                {t('candidateJobDetails.submitApplication')}
                            </p>

                            <label
                                htmlFor="cover-letter"
                                className="candidate-job-application-label"
                            >
                                {t('candidateJobDetails.coverLetter')}{' '}
                                <span>
                                    ({t('candidateJobDetails.optional')})
                                </span>
                            </label>

                            <textarea
                                id="cover-letter"
                                value={coverLetter}
                                onChange={(event) =>
                                    setCoverLetter(event.target.value)
                                }
                                maxLength={2000}
                                rows={8}
                                placeholder={t(
                                    'candidateJobDetails.coverLetterPlaceholder',
                                )}
                                disabled={isSubmittingApplication}
                            />

                            {applicationError && (
                                <p
                                    className="candidate-job-application-error"
                                    role="alert"
                                >
                                    {applicationError}
                                </p>
                            )}

                            <button
                                type="button"
                                className="candidate-job-application-button"
                                onClick={() => void handleApply()}
                                disabled={isSubmittingApplication}
                            >
                                {isSubmittingApplication
                                    ? t('candidateJobDetails.submitting')
                                    : t('candidateJobDetails.applyNow')}
                            </button>
                        </>
                    )}
                </section>

                <section className="candidate-job-details-section">
                    <h2>{t('candidateJobDetails.requiredSkills')}</h2>

                    {requiredSkills.length === 0 ? (
                        <p>
                            {t('candidateJobDetails.noRequiredSkills')}
                        </p>
                    ) : (
                        <ul className="candidate-job-skill-list">
                            {requiredSkills.map((requirement) => (
                                <li key={requirement.id}>
                                    <strong>
                                        {requirement.skill.name}
                                    </strong>

                                    <span>
                                        {t('candidateJobDetails.minimumLevel')}:{' '}
                                        {requirement.minimumLevel}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="candidate-job-details-section">
                    <h2>{t('candidateJobDetails.preferredSkills')}</h2>

                    {preferredSkills.length === 0 ? (
                        <p>
                            {t('candidateJobDetails.noPreferredSkills')}
                        </p>
                    ) : (
                        <ul className="candidate-job-skill-list">
                            {preferredSkills.map((requirement) => (
                                <li key={requirement.id}>
                                    <strong>
                                        {requirement.skill.name}
                                    </strong>

                                    <span>
                                        {t('candidateJobDetails.minimumLevel')}:{' '}
                                        {requirement.minimumLevel}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="candidate-job-details-section">
                    <h2>{t('candidateJobDetails.company')}</h2>

                    <dl className="candidate-job-company-details">
                        <div>
                            <dt>{t('candidateJobDetails.name')}</dt>
                            <dd>{job.company.name}</dd>
                        </div>

                        {job.company.location && (
                            <div>
                                <dt>{t('candidateJobDetails.location')}</dt>
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
                            {t('candidateJobDetails.published')}
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
