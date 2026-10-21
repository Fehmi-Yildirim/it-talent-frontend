import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    getApplicationCv,
    getRecruiterApplication,
    updateApplicationStatus,
} from '../features/applications/applications.api'
import { ApiError } from '../services/api/apiError'
import type {
    ApplicationStatus,
    RecruiterApplicationDetail,
} from '../types/application'
import { LOCALES } from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import { APPLICATION_STATUSES } from '../types/application'
import './RecruiterApplicationDetailsPage.css'

function RecruiterApplicationDetailsPage() {
    const { applicationId } = useParams<{ applicationId: string }>()
    const { language, t } = useTranslation()

    const [application, setApplication] =
        useState<RecruiterApplicationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [errorStatus, setErrorStatus] = useState<number | null>(null)
    const [updateError, setUpdateError] = useState<string | null>(null)
    const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null)
    const [isCvPdf, setIsCvPdf] = useState(false)
    const [loadingCv, setLoadingCv] = useState(false)
    const [cvError, setCvError] = useState(false)

    useEffect(
        () => () => {
            if (cvPreviewUrl) {
                URL.revokeObjectURL(cvPreviewUrl)
            }
        },
        [cvPreviewUrl],
    )

    function formatStatus(status: ApplicationStatus): string {
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

    function formatDate(value: string): string {
        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return value
        }

        return new Intl.DateTimeFormat(LOCALES[language], {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date)
    }

    useEffect(() => {
        let cancelled = false

        async function loadApplication() {
            if (!applicationId) {
                setErrorStatus(404)
                setLoading(false)
                return
            }

            setLoading(true)
            setErrorStatus(null)

            try {
                const result = await getRecruiterApplication(applicationId)

                if (!cancelled) {
                    setApplication(result)
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

        void loadApplication()

        return () => {
            cancelled = true
        }
    }, [applicationId])

    async function handleStatusChange(status: ApplicationStatus) {
        if (!applicationId || updating) {
            return
        }

        setUpdating(true)
        setUpdateError(null)

        try {
            const result = await updateApplicationStatus(applicationId, { status })
            setApplication((current) =>
                current
                    ? {
                          ...current,
                          ...result,
                          candidate: current.candidate,
                          job: current.job,
                          company: current.company,
                      }
                    : current,
            )
        } catch (caught) {
            if (caught instanceof ApiError) {
                if (caught.status === 401 || caught.status === 403) {
                    setUpdateError(
                        t('recruiterApplications.details.updateUnauthorized'),
                    )
                } else if (caught.status === 400) {
                    setUpdateError(
                        t('recruiterApplications.details.invalidStatus'),
                    )
                } else {
                    setUpdateError(
                        t('recruiterApplications.details.updateError'),
                    )
                }
            } else {
                setUpdateError(t('recruiterApplications.details.updateError'))
            }
        } finally {
            setUpdating(false)
        }
    }

    async function handleViewCv() {
        if (!application || !application.cvUrl || loadingCv) {
            return
        }

        setLoadingCv(true)
        setCvError(false)

        try {
            const blob = await getApplicationCv(application.id)
            const previewUrl = URL.createObjectURL(blob)

            setCvPreviewUrl((currentUrl) => {
                if (currentUrl) {
                    URL.revokeObjectURL(currentUrl)
                }

                return previewUrl
            })
            setIsCvPdf(blob.type === 'application/pdf')
        } catch {
            setCvError(true)
        } finally {
            setLoadingCv(false)
        }
    }

    if (loading) {
        return (
            <section className="recruiter-application-details-page">
                <section
                    className="recruiter-details-state"
                    role="status"
                    aria-live="polite"
                >
                    <span className="recruiter-details-spinner" aria-hidden="true" />
                    <p>{t('recruiterApplications.details.loading')}</p>
                </section>
            </section>
        )
    }

    if (errorStatus !== null) {
        const isAccessDenied = errorStatus === 401 || errorStatus === 403
        const isNotFound = errorStatus === 404

        return (
            <section className="recruiter-application-details-page">
                <section className="recruiter-details-state recruiter-details-error" role="alert">
                    <h1>
                        {isAccessDenied
                            ? t('recruiterApplications.details.accessDenied')
                            : isNotFound
                                ? t('recruiterApplications.details.applicationNotFound')
                                : t('recruiterApplications.details.unableToLoad')}
                    </h1>
                    <p>
                        {isAccessDenied
                            ? t('recruiterApplications.details.unauthorized')
                            : isNotFound
                                ? t('recruiterApplications.details.notFound')
                                : t('recruiterApplications.details.loadError')}
                    </p>
                    <Link
                        className="recruiter-details-back-link"
                        to="/recruiter/applications"
                    >
                        <span aria-hidden="true">←</span>
                        {t('recruiterApplications.details.backToApplications')}
                    </Link>
                </section>
            </section>
        )
    }

    if (!application) {
        return null
    }

    const candidateName =
        [application.candidate.firstName, application.candidate.lastName]
            .filter(Boolean)
            .join(' ') || 'Onbekende kandidaat'

    const initials = candidateName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toLocaleUpperCase(LOCALES[language]))
        .join('')

    const statusClass = application.status.toLowerCase()

    return (
        <section className="recruiter-application-details-page">
            <Link
                className="recruiter-details-back-link"
                to="/recruiter/applications"
            >
                <span aria-hidden="true">←</span>
                {t('recruiterApplications.details.backToApplications')}
            </Link>

            <section className="recruiter-details-title-card">
                <div className="recruiter-details-candidate-avatar" aria-hidden="true">
                    {initials || '?'}
                </div>
                <div className="recruiter-details-heading">
                    <p className="recruiter-details-eyebrow">
                        {t('recruiterApplications.details.eyebrow')}
                    </p>
                    <h1>{application.job.title}</h1>
                    <p className="recruiter-details-candidate-name">{candidateName}</p>
                </div>
                <span className={`recruiter-details-status recruiter-details-status--${statusClass}`}>
                    {formatStatus(application.status)}
                </span>
            </section>

            <div className="recruiter-details-layout">
                <div className="recruiter-details-main-column">
                    <section className="recruiter-details-card">
                        <div className="recruiter-details-card-heading">
                            <span className="recruiter-details-section-icon" aria-hidden="true">▤</span>
                            <h2>{t('recruiterApplications.details.application')}</h2>
                        </div>
                        <dl className="recruiter-details-metadata">
                            <div className="recruiter-details-metadata-item">
                                <dt>{t('common.status')}</dt>
                                <dd>
                                    <span className={`recruiter-details-status recruiter-details-status--${statusClass}`}>
                                        {formatStatus(application.status)}
                                    </span>
                                </dd>
                            </div>
                            <div className="recruiter-details-metadata-item">
                                <dt>{t('common.applied')}</dt>
                                <dd>{formatDate(application.createdAt)}</dd>
                            </div>
                            {application.updatedAt && (
                                <div className="recruiter-details-metadata-item">
                                    <dt>{t('recruiterApplications.details.lastUpdated')}</dt>
                                    <dd>{formatDate(application.updatedAt)}</dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <section className="recruiter-details-card">
                        <div className="recruiter-details-card-heading">
                            <span className="recruiter-details-section-icon" aria-hidden="true">♙</span>
                            <h2>{t('common.candidate')}</h2>
                        </div>
                        <dl className="recruiter-details-metadata">
                            <div className="recruiter-details-metadata-item">
                                <dt>{t('common.name')}</dt>
                                <dd>{candidateName}</dd>
                            </div>
                            <div className="recruiter-details-metadata-item">
                                <dt>{t('common.email')}</dt>
                                <dd>
                                    <a href={`mailto:${application.candidate.email}`}>
                                        {application.candidate.email}
                                    </a>
                                </dd>
                            </div>
                            <div className="recruiter-details-metadata-item">
                                <dt>{t('profile.headline')}</dt>
                                <dd>{application.candidate.headline || t('common.notSpecified')}</dd>
                            </div>
                            <div className="recruiter-details-metadata-item">
                                <dt>{t('common.location')}</dt>
                                <dd>{application.candidate.location || t('common.notSpecified')}</dd>
                            </div>
                            <div className="recruiter-details-metadata-item recruiter-details-metadata-item--full">
                                <dt>{t('profile.summary')}</dt>
                                <dd>{application.candidate.summary || t('common.notSpecified')}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="recruiter-details-card">
                        <div className="recruiter-details-card-heading">
                            <span className="recruiter-details-section-icon" aria-hidden="true">▤</span>
                            <h2>{t('recruiterApplications.details.coverLetter')}</h2>
                        </div>
                        {application.coverLetter ? (
                            <p className="recruiter-details-cover-letter">
                                {application.coverLetter}
                            </p>
                        ) : (
                            <p className="recruiter-details-muted">
                                {t('recruiterApplications.coverLetterIncluded')}
                            </p>
                        )}
                    </section>
                    <section className="recruiter-details-card">
                        <div className="recruiter-details-card-heading">
                            <span className="recruiter-details-section-icon" aria-hidden="true">CV</span>
                            <h2>{t('recruiterApplications.details.cv')}</h2>
                        </div>
                        {!application.cvUrl ? (
                            <p className="recruiter-details-muted">
                                {t('recruiterApplications.details.cvUnavailable')}
                            </p>
                        ) : (
                            <>
                                {!cvPreviewUrl && (
                                    <button
                                        className="recruiter-details-button recruiter-details-button--neutral"
                                        type="button"
                                        disabled={loadingCv}
                                        onClick={() => void handleViewCv()}
                                    >
                                        {loadingCv
                                            ? t('recruiterApplications.details.loadingCv')
                                            : t('candidateJobDetails.viewCv')}
                                    </button>
                                )}
                                {cvError && (
                                    <p className="recruiter-details-update-error" role="alert">
                                        {t('recruiterApplications.details.cvLoadError')}
                                    </p>
                                )}
                                {cvPreviewUrl && (
                                    <>
                                        <a
                                            className="recruiter-details-cv-open"
                                            href={cvPreviewUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {t('candidateJobDetails.viewCv')}
                                        </a>
                                        {isCvPdf && (
                                            <iframe
                                                className="recruiter-details-cv-preview"
                                                src={cvPreviewUrl}
                                                title={t('recruiterApplications.details.cv')}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </section>
                </div>

                {application.status !== APPLICATION_STATUSES.WITHDRAWN && (
                    <aside className="recruiter-details-sidebar">
                        <section className="recruiter-details-card recruiter-details-actions-card">
                            <p className="recruiter-details-eyebrow">
                                {t('recruiterApplications.details.updateStatus')}
                            </p>
                            <h2>{t('common.status')}</h2>
                            <p className="recruiter-details-muted">
                                {t('recruiterApplications.details.eyebrow')}
                            </p>

                            {updateError && (
                                <p className="recruiter-details-update-error" role="alert">
                                    {updateError}
                                </p>
                            )}

                            <div className="recruiter-details-actions">
                                <button
                                    className="recruiter-details-button recruiter-details-button--neutral"
                                    type="button"
                                    disabled={updating || application.status === APPLICATION_STATUSES.PENDING}
                                    onClick={() => void handleStatusChange(APPLICATION_STATUSES.PENDING)}
                                >
                                    {t('common.pending')}
                                </button>
                                <button
                                    className="recruiter-details-button recruiter-details-button--primary"
                                    type="button"
                                    disabled={updating || application.status === APPLICATION_STATUSES.REVIEWING}
                                    onClick={() => void handleStatusChange(APPLICATION_STATUSES.REVIEWING)}
                                >
                                    {t('common.reviewing')}
                                </button>
                                <button
                                    className="recruiter-details-button recruiter-details-button--success"
                                    type="button"
                                    disabled={updating || application.status === APPLICATION_STATUSES.ACCEPTED}
                                    onClick={() => void handleStatusChange(APPLICATION_STATUSES.ACCEPTED)}
                                >
                                    {t('recruiterApplications.details.accept')}
                                </button>
                                <button
                                    className="recruiter-details-button recruiter-details-button--danger"
                                    type="button"
                                    disabled={updating || application.status === APPLICATION_STATUSES.REJECTED}
                                    onClick={() => void handleStatusChange(APPLICATION_STATUSES.REJECTED)}
                                >
                                    {t('recruiterApplications.details.reject')}
                                </button>
                            </div>

                            {updating && (
                                <p className="recruiter-details-updating" role="status" aria-live="polite">
                                    {t('recruiterApplications.details.updatingStatus')}
                                </p>
                            )}
                        </section>
                    </aside>
                )}
            </div>
        </section>
    )
}

export default RecruiterApplicationDetailsPage
