import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../features/jobs/jobs.api'
import {
    EMPLOYMENT_TYPE_TRANSLATION_KEYS,
    WORK_MODE_TRANSLATION_KEYS,
} from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import type { Job } from '../types/job'
import './RecruiterJobsPage.css'

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

    const employmentTypeLabel = (value: Job['employmentType']) =>
        t(EMPLOYMENT_TYPE_TRANSLATION_KEYS[value])

    const workModeLabel = (value: Job['workMode']) =>
        t(WORK_MODE_TRANSLATION_KEYS[value])

    const statusLabel = (value: Job['status']) =>
        t(`recruiterJobs.${value.toLowerCase()}` as import('../i18n').TranslationKey)

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
                                        {statusLabel(job.status)}
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