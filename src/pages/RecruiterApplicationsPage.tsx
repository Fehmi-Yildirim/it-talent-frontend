import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecruiterApplications } from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import { useTranslation } from '../i18n/context'
import type {
    ApplicationStatus,
    RecruiterApplication,
} from '../types/application'

function formatStatus(
    status: ApplicationStatus,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (status) {
        case 'PENDING':
            return t('recruiterApplications.pending')
        case 'REVIEWING':
            return t('recruiterApplications.reviewing')
        case 'ACCEPTED':
            return t('recruiterApplications.accepted')
        case 'REJECTED':
            return t('recruiterApplications.rejected')
        case 'WITHDRAWN':
            return t('recruiterApplications.withdrawn')
        default:
            return status
    }
}

function formatDate(
    value: string,
    locale: string,
): string {
    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function RecruiterApplicationsPage() {
    const { language, t } = useTranslation()

    const [applications, setApplications] = useState<
        RecruiterApplication[]
    >([])
    const [selectedJob, setSelectedJob] = useState('')
    const [selectedStatus, setSelectedStatus] =
        useState<ApplicationStatus | ''>('')
    const [loading, setLoading] = useState(true)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)

    const locale =
        language === 'nl' ? 'nl-NL' : 'en-US'

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
                    setErrorStatus(
                        caught instanceof ApiError
                            ? caught.status
                            : 500,
                    )
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
            uniqueJobs.set(
                application.job.id,
                application.job.title,
            )
        }

        return Array.from(uniqueJobs.entries()).sort((a, b) =>
            a[1].localeCompare(b[1]),
        )
    }, [applications])

    const filteredApplications = useMemo(() => {
        return applications.filter((application) => {
            const matchesJob =
                selectedJob === '' ||
                application.job.id === selectedJob

            const matchesStatus =
                selectedStatus === '' ||
                application.status === selectedStatus

            return matchesJob && matchesStatus
        })
    }, [applications, selectedJob, selectedStatus])

    if (loading) {
        return (
            <section className="recruiter-applications-page">
                <p
                    role="status"
                    aria-live="polite"
                >
                    {t('recruiterApplications.loading')}
                </p>
            </section>
        )
    }

    if (errorStatus !== null) {
        const isAccessDenied =
            errorStatus === 401 || errorStatus === 403

        return (
            <section className="recruiter-applications-page">
                <section role="alert">
                    <h1>
                        {isAccessDenied
                            ? t(
                                'recruiterApplications.accessDenied',
                            )
                            : t(
                                'recruiterApplications.unableToLoad',
                            )}
                    </h1>

                    <p>
                        {isAccessDenied
                            ? t(
                                'recruiterApplications.unauthorized',
                            )
                            : t(
                                'recruiterApplications.loadError',
                            )}
                    </p>
                </section>
            </section>
        )
    }

    return (
        <section className="recruiter-applications-page">
            <header>
                <p>{t('recruiterApplications.eyebrow')}</p>

                <h1>{t('recruiterApplications.title')}</h1>

                <p>
                    {t(
                        'recruiterApplications.description',
                    )}
                </p>
            </header>

            <section
                aria-label={t(
                    'recruiterApplications.filters',
                )}
            >
                <label>
                    {t('recruiterApplications.job')}

                    <select
                        value={selectedJob}
                        onChange={(event) =>
                            setSelectedJob(event.target.value)
                        }
                    >
                        <option value="">
                            {t(
                                'recruiterApplications.allJobs',
                            )}
                        </option>

                        {jobs.map(([jobId, jobTitle]) => (
                            <option
                                key={jobId}
                                value={jobId}
                            >
                                {jobTitle}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    {t('recruiterApplications.status')}

                    <select
                        value={selectedStatus}
                        onChange={(event) =>
                            setSelectedStatus(
                                event.target.value as
                                | ApplicationStatus
                                | '',
                            )
                        }
                    >
                        <option value="">
                            {t(
                                'recruiterApplications.allStatuses',
                            )}
                        </option>

                        <option value="PENDING">
                            {t(
                                'recruiterApplications.pending',
                            )}
                        </option>

                        <option value="REVIEWING">
                            {t(
                                'recruiterApplications.reviewing',
                            )}
                        </option>

                        <option value="ACCEPTED">
                            {t(
                                'recruiterApplications.accepted',
                            )}
                        </option>

                        <option value="REJECTED">
                            {t(
                                'recruiterApplications.rejected',
                            )}
                        </option>

                        <option value="WITHDRAWN">
                            {t(
                                'recruiterApplications.withdrawn',
                            )}
                        </option>
                    </select>
                </label>
            </section>

            {filteredApplications.length === 0 ? (
                <section>
                    <h2>
                        {t(
                            'recruiterApplications.noApplications',
                        )}
                    </h2>

                    <p>
                        {t(
                            'recruiterApplications.noApplicationsMatch',
                        )}
                    </p>
                </section>
            ) : (
                <div>
                    {filteredApplications.map(
                        (application) => (
                            <article
                                key={application.id}
                            >
                                <header>
                                    <h2>
                                        <Link
                                            to={`/recruiter/applications/${application.id}`}
                                        >
                                            {
                                                application.job
                                                    .title
                                            }
                                        </Link>
                                    </h2>

                                    <span>
                                        {formatStatus(
                                            application.status,
                                            t,
                                        )}
                                    </span>
                                </header>

                                <p>
                                    {
                                        application.candidate
                                            .firstName
                                    }{' '}
                                    {
                                        application.candidate
                                            .lastName
                                    }
                                </p>

                                <p>
                                    {t(
                                        'recruiterApplications.applied',
                                    )}
                                    {': '}
                                    {formatDate(
                                        application.createdAt,
                                        locale,
                                    )}
                                </p>

                                {application.coverLetter && (
                                    <p>
                                        {t(
                                            'recruiterApplications.coverLetterIncluded',
                                        )}
                                    </p>
                                )}
                            </article>
                        ),
                    )}
                </div>
            )}
        </section>
    )
}

export default RecruiterApplicationsPage
