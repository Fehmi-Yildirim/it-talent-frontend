import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../features/jobs/jobs.api'
import { useTranslation } from '../i18n/useTranslation'
import type { Job } from '../types/job'
import './RecruiterJobsPage.css'

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
    job: Job,
    t: (key: import('../i18n').TranslationKey) => string,
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

    return `${t('recruiterJobs.upTo')} ${currency} ${job.salaryMax}`
}

export default function RecruiterJobsPage() {
    const { t } = useTranslation()

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

    if (loading) {
        return (
            <main className="recruiter-jobs-page">
                <div className="recruiter-jobs-header">
                    <div>
                        <h1>{t('recruiterJobs.title')}</h1>

                        <p>
                            {t('recruiterJobs.description')}
                        </p>
                    </div>
                </div>

                <div
                    className="recruiter-jobs-state"
                    role="status"
                >
                    {t('recruiterJobs.loading')}
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="recruiter-jobs-page">
                <div className="recruiter-jobs-header">
                    <div>
                        <h1>{t('recruiterJobs.title')}</h1>

                        <p>
                            {t('recruiterJobs.description')}
                        </p>
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
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        {t('recruiterJobs.tryAgain')}
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="recruiter-jobs-page">
            <div className="recruiter-jobs-header">
                <div>
                    <h1>{t('recruiterJobs.title')}</h1>

                    <p>
                        {t('recruiterJobs.description')}
                    </p>
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

                    <p>
                        {t(
                            'recruiterJobs.noJobsDescription',
                        )}
                    </p>

                    <Link
                        className="recruiter-jobs-primary-button"
                        to="/recruiter/jobs/new"
                    >
                        {t('recruiterJobs.createFirstJob')}
                    </Link>
                </section>
            ) : (
                <section
                    className="recruiter-jobs-list"
                    aria-label={t('recruiterJobs.yourJobs')}
                >
                    {jobs.map((job) => (
                        <article
                            className="recruiter-job-card"
                            key={job.id}
                        >
                            <div className="recruiter-job-card-main">
                                <div className="recruiter-job-card-title">
                                    <h2>{job.title}</h2>

                                    <span
                                        className={`recruiter-job-status recruiter-job-status-${job.status.toLowerCase()}`}
                                    >
                                        {formatStatus(
                                            job.status,
                                            t,
                                        )}
                                    </span>
                                </div>

                                <p className="recruiter-job-location">
                                    {job.location ??
                                        t(
                                            'recruiterJobs.locationNotSpecified',
                                        )}
                                </p>

                                <div className="recruiter-job-meta">
                                    <span>
                                        {formatEmploymentType(
                                            job.employmentType,
                                            t,
                                        )}
                                    </span>

                                    <span>
                                        {formatWorkMode(
                                            job.workMode,
                                            t,
                                        )}
                                    </span>

                                    <span>
                                        {formatSalary(job, t)}
                                    </span>
                                </div>
                            </div>

                            <div className="recruiter-job-card-actions">
                                <Link
                                    className="recruiter-jobs-secondary-button"
                                    to={`/recruiter/jobs/${job.id}`}
                                >
                                    {t('recruiterJobs.view')}
                                </Link>

                                <Link
                                    className="recruiter-jobs-secondary-button"
                                    to={`/recruiter/jobs/${job.id}/edit`}
                                >
                                    {t('recruiterJobs.edit')}
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    )
}
