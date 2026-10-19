
import {
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import { createApplication } from '../features/applications/applications.api'
import {
    deleteCandidateCv,
    getCandidateProfile,
    uploadCandidateCv,
} from '../features/candidate/candidate.api'
import { getCandidateJobById } from '../features/jobs/jobs.api'
import { ApiError } from '../services/api/apiError'
import { useTranslation } from '../i18n/useTranslation'
import type { CandidateJob } from '../types/job'
import './CandidateJobApplicationPage.css'
import { env } from '../config/env'
import { authToken } from '../services/api/authToken'

const ACCEPTED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx']

const ACCEPTED_CV_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function isValidCvFile(file: File): boolean {
    const fileName = file.name.toLowerCase()

    const hasValidExtension = ACCEPTED_CV_EXTENSIONS.some((extension) =>
        fileName.endsWith(extension),
    )

    if (!hasValidExtension) {
        return false
    }

    return !file.type || ACCEPTED_CV_MIME_TYPES.includes(file.type)
}

async function isPdfBlob(blob: Blob): Promise<boolean> {
    const header = await blob.slice(0, 5).text()
    return header === '%PDF-'
}

function formatSalary(
    salaryMin: string | number | null,
    salaryMax: string | number | null,
    currency: string | null,
    locale: string,
    notSpecified: string,
    fromLabel: string,
    upToLabel: string,
): string {
    if (salaryMin === null && salaryMax === null) {
        return notSpecified
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

    const currencyLabel = currency ? ` ${currency} ` : ''

    if (salaryMin !== null && salaryMax !== null) {
        return `${formatAmount(salaryMin)} - ${formatAmount(salaryMax)}${currencyLabel}`
    }

    if (salaryMin !== null) {
        return `${fromLabel} ${formatAmount(salaryMin)}${currencyLabel}`
    }

    return `${upToLabel} ${formatAmount(salaryMax!)}${currencyLabel}`
}

function LoadingSpinner() {
    return (
        <svg
            className="candidate-job-cv-loading-spinner"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            role="presentation"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.2"
            />
            <path
                d="M21 12a9 9 0 0 0-9-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="0.8s"
                    repeatCount="indefinite"
                />
            </path>
        </svg>
    )
}

export default function CandidateJobApplicationPage() {
    const { jobId } = useParams<{ jobId: string }>()
    const { language, t } = useTranslation()

    const [job, setJob] = useState<CandidateJob | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [coverLetter, setCoverLetter] = useState('')
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [cvFileError, setCvFileError] = useState<string | null>(null)
    const [cvRetentionConsent, setCvRetentionConsent] = useState(false)

    const [candidateCv, setCandidateCv] = useState<{
        cvOriginalName: string | null
        cvMimeType: string | null
        cvSize: number | null
        cvExpiresAt: string | null
        cvRetentionConsent: boolean
        cvConsentAt: string | null
        cvUrl: string | null
    } | null>(null)

    const [isReplacingCv, setIsReplacingCv] = useState(false)
    const [isCvSettingsOpen, setIsCvSettingsOpen] = useState(false)
    const [isDeleteCvDialogOpen, setIsDeleteCvDialogOpen] = useState(false)
    const [isDeletingCv, setIsDeletingCv] = useState(false)
    const [isLoadingExistingCv, setIsLoadingExistingCv] = useState(false)
    const [isUploadingCv, setIsUploadingCv] = useState(false)

    const [existingCvPreviewUrl, setExistingCvPreviewUrl] =
        useState<string | null>(null)

    const [existingCvPreviewError, setExistingCvPreviewError] =
        useState<string | null>(null)

    const [selectedCvPreviewUrl, setSelectedCvPreviewUrl] =
        useState<string | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isReviewing, setIsReviewing] = useState(false)

    const locale = language

    const loadData = useCallback(async () => {
        if (!jobId) {
            setLoadError(t('candidateJobDetails.jobIdMissing'))
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setLoadError(null)

        try {
            const [jobData, candidateData] = await Promise.all([
                getCandidateJobById(jobId),
                getCandidateProfile(),
            ])

            setJob(jobData)

            setCandidateCv({
                cvOriginalName: candidateData.cvOriginalName ?? null,
                cvMimeType: candidateData.cvMimeType ?? null,
                cvSize: candidateData.cvSize ?? null,
                cvExpiresAt: candidateData.cvExpiresAt ?? null,
                cvRetentionConsent:
                    candidateData.cvRetentionConsent ?? false,
                cvConsentAt: candidateData.cvConsentAt ?? null,
                cvUrl: candidateData.cvUrl ?? null,
            })
        } catch (caught) {
            if (caught instanceof ApiError) {
                setLoadError(
                    caught.status === 404
                        ? t('candidateJobDetails.jobUnavailable')
                        : t('candidateJobDetails.loadError'),
                )
            } else {
                setLoadError(t('candidateJobDetails.loadError'))
            }
        } finally {
            setIsLoading(false)
        }
    }, [jobId, t])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const hasExistingCv = Boolean(candidateCv?.cvOriginalName)

    useEffect(() => {
        let cancelled = false

        async function fetchCandidateCvBlob(): Promise<Blob> {
            const token = authToken.get()

            const response = await fetch(
                `${env.apiBaseUrl.replace(/\/$/, '')}/candidates/me/cv`,
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                },
            )

            if (!response.ok) {
                throw new Error('Failed to load candidate CV')
            }

            return response.blob()
        }

        async function loadExistingCv() {
            if (!hasExistingCv || isReplacingCv) {
                setIsLoadingExistingCv(false)
                return
            }

            setIsLoadingExistingCv(true)
            setExistingCvPreviewError(null)

            try {
                const blob = await fetchCandidateCvBlob()

                if (cancelled) {
                    return
                }

                if (!(await isPdfBlob(blob))) {
                    setExistingCvPreviewError(
                        t('candidateJobDetails.cvPdfPreviewOnly'),
                    )
                    return
                }

                const pdfBlob = new Blob([blob], {
                    type: 'application/pdf',
                })
                const url = URL.createObjectURL(pdfBlob)

                if (cancelled) {
                    URL.revokeObjectURL(url)
                    return
                }

                setExistingCvPreviewUrl((previousUrl) => {
                    if (previousUrl) {
                        URL.revokeObjectURL(previousUrl)
                    }

                    return url
                })
            } catch {
                if (!cancelled) {
                    setExistingCvPreviewError(
                        t('candidateJobDetails.cvPreviewError'),
                    )
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingExistingCv(false)
                }
            }
        }

        if (hasExistingCv && !isReplacingCv) {
            void loadExistingCv()
        } else {
            setIsLoadingExistingCv(false)
        }

        return () => {
            cancelled = true
        }
    }, [candidateCv, hasExistingCv, isReplacingCv, t])

    useEffect(() => {
        return () => {
            if (existingCvPreviewUrl) {
                URL.revokeObjectURL(existingCvPreviewUrl)
            }

            if (selectedCvPreviewUrl) {
                URL.revokeObjectURL(selectedCvPreviewUrl)
            }
        }
    }, [existingCvPreviewUrl, selectedCvPreviewUrl])

    const resetCvSelection = useCallback(() => {
        setCvFile(null)
        setCvFileError(null)
        setCvRetentionConsent(false)

        setSelectedCvPreviewUrl((previousUrl) => {
            if (previousUrl) {
                URL.revokeObjectURL(previousUrl)
            }

            return null
        })
    }, [])

    const handleCvChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        if (!isValidCvFile(file)) {
            setCvFileError(t('candidateJobDetails.invalidCvFile'))
            setCvFile(null)

            setSelectedCvPreviewUrl((previousUrl) => {
                if (previousUrl) {
                    URL.revokeObjectURL(previousUrl)
                }

                return null
            })

            event.target.value = ''
            return
        }

        setCvFileError(null)
        setSubmitError(null)
        setCvFile(file)

        setSelectedCvPreviewUrl((previousUrl) => {
            if (previousUrl) {
                URL.revokeObjectURL(previousUrl)
            }

            return null
        })

        // A PDF can be previewed locally immediately.
        // DOC/DOCX files must first be converted by the backend.
        if (file.name.toLowerCase().endsWith('.pdf')) {
            if (await isPdfBlob(file)) {
                setSelectedCvPreviewUrl(URL.createObjectURL(file))
            } else {
                setCvFileError(t('candidateJobDetails.invalidCvFile'))
                setCvFile(null)
            }
        }
    }

    const handleToggleCvSettings = useCallback(() => {
        setIsCvSettingsOpen((previous) => !previous)
        setSubmitError(null)
    }, [])

    const handleReplaceCv = useCallback(() => {
        setIsCvSettingsOpen(false)
        setIsReplacingCv(true)
        setSubmitError(null)
        setCvFileError(null)
        setCvFile(null)
        setCvRetentionConsent(false)

        setSelectedCvPreviewUrl((previousUrl) => {
            if (previousUrl) {
                URL.revokeObjectURL(previousUrl)
            }

            return null
        })
    }, [])

    const handleDeleteCv = useCallback(async () => {
        if (isDeletingCv || !hasExistingCv) {
            return
        }

        setIsDeletingCv(true)
        setSubmitError(null)

        try {
            await deleteCandidateCv()

            setCandidateCv(null)
            setIsDeleteCvDialogOpen(false)
            setIsCvSettingsOpen(false)
            setIsReplacingCv(false)

            resetCvSelection()

            setExistingCvPreviewUrl((previousUrl) => {
                if (previousUrl) {
                    URL.revokeObjectURL(previousUrl)
                }

                return null
            })

            setExistingCvPreviewError(null)
        } catch {
            setSubmitError(t('candidateJobDetails.deleteCvError'))
        } finally {
            setIsDeletingCv(false)
        }
    }, [hasExistingCv, isDeletingCv, resetCvSelection, t])

    const handleOpenDeleteCvDialog = useCallback(() => {
        if (isDeletingCv || !hasExistingCv) {
            return
        }

        setIsCvSettingsOpen(false)
        setIsDeleteCvDialogOpen(true)
        setSubmitError(null)
    }, [hasExistingCv, isDeletingCv])

    const handleCancelDeleteCv = useCallback(() => {
        if (isDeletingCv) {
            return
        }

        setIsDeleteCvDialogOpen(false)
    }, [isDeletingCv])

    const uploadSelectedCv = useCallback(
        async (
            fileToUpload: File | null = cvFile,
            retentionConsent: boolean = cvRetentionConsent,
        ): Promise<boolean> => {
            if (!fileToUpload) {
                return true
            }

            if (!retentionConsent) {
                setSubmitError(
                    t('candidateJobDetails.cvRetentionConsentRequired'),
                )
                return false
            }

            setIsUploadingCv(true)
            setSubmitError(null)

            try {
                const updatedCandidate = await uploadCandidateCv(
                    fileToUpload,
                    retentionConsent,
                )

                setCandidateCv({
                    cvOriginalName:
                        updatedCandidate.cvOriginalName ?? fileToUpload.name,
                    cvMimeType:
                        updatedCandidate.cvMimeType ?? fileToUpload.type,
                    cvSize: updatedCandidate.cvSize ?? fileToUpload.size,
                    cvExpiresAt: updatedCandidate.cvExpiresAt ?? null,
                    cvRetentionConsent:
                        updatedCandidate.cvRetentionConsent ??
                        retentionConsent,
                    cvConsentAt: updatedCandidate.cvConsentAt ?? null,
                    cvUrl: updatedCandidate.cvUrl ?? null,
                })

                setIsReplacingCv(false)
                resetCvSelection()

                setExistingCvPreviewUrl((previousUrl) => {
                    if (previousUrl) {
                        URL.revokeObjectURL(previousUrl)
                    }

                    return null
                })

                setExistingCvPreviewError(null)

                return true
            } catch (caught) {
                if (caught instanceof ApiError) {
                    setSubmitError(
                        caught.status === 400
                            ? t('candidateJobDetails.invalidCvFile')
                            : t('candidateJobDetails.cvUploadError'),
                    )
                } else {
                    setSubmitError(t('candidateJobDetails.cvUploadError'))
                }

                return false
            } finally {
                setIsUploadingCv(false)
            }
        },
        [cvFile, cvRetentionConsent, resetCvSelection, t],
    )

    const validateApplication = useCallback((): boolean => {
        if (!coverLetter.trim()) {
            setSubmitError(
                t('candidateJobDetails.coverLetterRequired'),
            )
            return false
        }

        if (cvFileError) {
            return false
        }

        if (!cvFile && !hasExistingCv) {
            setSubmitError(t('candidateJobDetails.cvRequired'))
            return false
        }

        if (cvFile && !cvRetentionConsent) {
            setSubmitError(
                t('candidateJobDetails.cvRetentionConsentRequired'),
            )
            return false
        }

        setSubmitError(null)
        return true
    }, [
        coverLetter,
        cvFile,
        cvFileError,
        cvRetentionConsent,
        hasExistingCv,
        t,
    ])

    const handleContinueToReview = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        if (isUploadingCv || isSubmitting) {
            return
        }

        if (!validateApplication()) {
            return
        }

        if (cvFile) {
            const uploaded = await uploadSelectedCv()

            if (!uploaded) {
                return
            }
        }

        setSubmitError(null)
        setIsReviewing(true)
    }

    const handleBackToEdit = useCallback(() => {
        setIsReviewing(false)
        setSubmitError(null)
    }, [])

    const handleSubmitApplication = async () => {
        if (!jobId || isSubmitting || !validateApplication()) {
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            await createApplication(jobId, {
                coverLetter: coverLetter.trim(),
            })

            setIsSubmitted(true)
            setCoverLetter('')
            resetCvSelection()
            setIsReplacingCv(false)
            setIsReviewing(false)
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 409) {
                setSubmitError(
                    t('candidateJobDetails.alreadyAppliedDescription'),
                )
            } else if (caught instanceof ApiError) {
                setSubmitError(t('candidateJobDetails.submitError'))
            } else {
                setSubmitError(
                    t('candidateJobDetails.submitUnexpectedError'),
                )
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const cancelReplaceCv = useCallback(() => {
        setIsReplacingCv(false)
        resetCvSelection()
        setSubmitError(null)
    }, [resetCvSelection])

    if (isLoading) {
        return (
            <section className="candidate-job-application-page">
                <p role="status" aria-live="polite">
                    {t('candidateJobDetails.loading')}
                </p>
            </section>
        )
    }

    if (loadError || !job) {
        return (
            <section className="candidate-job-application-page">
                <div
                    className="candidate-job-application-state"
                    role="alert"
                >
                    <h1>{t('candidateJobDetails.unableToLoad')}</h1>
                    <p>
                        {loadError ?? t('candidateJobDetails.loadError')}
                    </p>
                    <button
                        type="button"
                        onClick={() => void loadData()}
                    >
                        {t('common.tryAgain')}
                    </button>
                </div>
            </section>
        )
    }

    if (isSubmitted) {
        return (
            <section className="candidate-job-application-card candidate-job-application-success">
                <h1>
                    {t('candidateJobDetails.applicationSubmitted')}
                </h1>
                <p>{t('candidateJobDetails.applicationSuccess')}</p>
                <Link to="/applications">
                    {t('candidateJobDetails.viewMyApplications')}
                </Link>
            </section>
        )
    }

    const showExistingCv =
        hasExistingCv && !isReplacingCv && !cvFile

    const showSelectedCv = Boolean(cvFile)

    if (isReviewing) {
        return (
            <div className="candidate-job-application-page">
                <Link
                    to={`/jobs/${job.id}`}
                    className="candidate-job-application-back"
                >
                    ← {t('candidateJobDetails.backToJobs')}
                </Link>

                <div className="candidate-job-application-intro">
                    <h1>{job.title}</h1>
                    <div className="candidate-job-application-meta">
                        <span>
                            {job.company.name}
                            {job.location && `, ${job.location}`}
                        </span>
                        <span>•</span>
                        <span>{job.workMode}</span>
                        <span>•</span>
                        <span>{job.employmentType}</span>
                        <span>•</span>
                        <span>
                            {formatSalary(
                                job.salaryMin,
                                job.salaryMax,
                                job.currency,
                                locale,
                                t('common.notSpecified'),
                                t('common.from'),
                                t('common.upTo'),
                            )}
                        </span>
                    </div>
                </div>

                <section
                    className="candidate-job-application-card candidate-job-application-review-card"
                    aria-labelledby="candidate-job-application-review-heading"
                >
                    <div className="candidate-job-application-review-header">
                        <div>
                            <p className="candidate-job-application-review-step">
                                {t('candidateJobDetails.reviewStep')}
                            </p>
                            <h2 id="candidate-job-application-review-heading">
                                {t('candidateJobDetails.reviewApplication')}
                            </h2>
                            <p>
                                {t(
                                    'candidateJobDetails.reviewApplicationDescription',
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="candidate-job-application-review-section">
                        <h3>{t('candidateJobDetails.reviewJob')}</h3>
                        <div className="candidate-job-application-review-value">
                            <strong>{job.title}</strong>
                            <span>
                                {job.company.name}
                                {job.location && `, ${job.location}`}
                            </span>
                        </div>
                    </div>

                    <div className="candidate-job-application-review-section">
                        <h3>
                            {t('candidateJobDetails.reviewCoverLetter')}
                        </h3>
                        <div className="candidate-job-application-review-text">
                            {coverLetter}
                        </div>
                    </div>

                    <div className="candidate-job-application-review-section">
                        <h3>{t('candidateJobDetails.reviewCv')}</h3>
                        {candidateCv?.cvOriginalName ? (
                            <div className="candidate-job-application-review-value">
                                <strong>{candidateCv.cvOriginalName}</strong>
                                <span>
                                    {candidateCv.cvMimeType === 'application/pdf'
                                        ? t('candidateJobDetails.cvSavedAsPdf')
                                        : t('candidateJobDetails.cvUploaded')}
                                </span>
                            </div>
                        ) : (
                            <p className="candidate-job-application-review-muted">
                                {t('candidateJobDetails.noCv')}
                            </p>
                        )}
                    </div>

                    {candidateCv?.cvRetentionConsent && (
                        <div className="candidate-job-application-review-section">
                            <h3>
                                {t('candidateJobDetails.reviewConsent')}
                            </h3>
                            <p className="candidate-job-application-review-consent">
                                ✓{' '}
                                {t(
                                    'candidateJobDetails.cvRetentionConsentGiven',
                                )}
                            </p>
                        </div>
                    )}

                    {submitError && (
                        <p
                            className="candidate-job-application-error"
                            role="alert"
                        >
                            {submitError}
                        </p>
                    )}

                    <div className="candidate-job-application-review-actions">
                        <button
                            type="button"
                            className="candidate-job-application-button candidate-job-application-review-back-button"
                            onClick={handleBackToEdit}
                            disabled={isSubmitting}
                        >
                            {t('candidateJobDetails.editApplication')}
                        </button>
                        <button
                            type="button"
                            className="candidate-job-application-button candidate-job-application-submit"
                            onClick={() => void handleSubmitApplication()}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? t('candidateJobDetails.submitting')
                                : t('candidateJobDetails.submitApplication')}
                        </button>
                    </div>
                </section>

                <ConfirmDialog
                    open={isDeleteCvDialogOpen}
                    title={t('common.confirmDeleteTitle')}
                    message={t(
                        'candidateJobDetails.deleteCvConfirmation',
                    )}
                    confirmLabel={t('common.delete')}
                    cancelLabel={t('common.cancel')}
                    destructive
                    onCancel={handleCancelDeleteCv}
                    onConfirm={() => void handleDeleteCv()}
                />
            </div>
        )
    }

    return (
        <div className="candidate-job-application-page">
            <Link
                to={`/jobs/${job.id}`}
                className="candidate-job-application-back"
            >
                ← {t('candidateJobDetails.backToJobs')}
            </Link>

            <div className="candidate-job-application-intro">
                <h1>{job.title}</h1>
                <div className="candidate-job-application-meta">
                    <span>
                        {job.company.name}
                        {job.location && `, ${job.location}`}
                    </span>
                    <span>•</span>
                    <span>{job.workMode}</span>
                    <span>•</span>
                    <span>{job.employmentType}</span>
                    <span>•</span>
                    <span>
                        {formatSalary(
                            job.salaryMin,
                            job.salaryMax,
                            job.currency,
                            locale,
                            t('common.notSpecified'),
                            t('common.from'),
                            t('common.upTo'),
                        )}
                    </span>
                </div>
            </div>

            <section
                className="candidate-job-application-card candidate-job-application-form-card"
                aria-labelledby="candidate-job-application-step-heading"
            >
                <p className="candidate-job-application-review-step">
                    {t('candidateJobDetails.applicationStep')}
                </p>
                <h2 id="candidate-job-application-step-heading">
                    {t('candidateJobDetails.applicationFormTitle')}
                </h2>
                <p>
                    {t('candidateJobDetails.applicationFormDescription')}
                </p>
            </section>

            <section
                className="candidate-job-application-card candidate-job-cv-card"
                aria-labelledby="candidate-job-cv-heading"
            >
                <div className="candidate-job-cv-header">
                    <div>
                        <h2 id="candidate-job-cv-heading">
                            {t('candidateJobDetails.cvUpload')}
                        </h2>

                        {showExistingCv && candidateCv?.cvOriginalName && (
                            <div className="candidate-job-cv-file">
                                <span className="candidate-job-cv-file-icon">
                                    📄
                                </span>
                                <div>
                                    <strong>
                                        {candidateCv.cvOriginalName}
                                    </strong>
                                    <span>
                                        {t('candidateJobDetails.cvUploaded')}
                                    </span>
                                </div>
                            </div>
                        )}

                    </div>

                    {showExistingCv && (
                        <button
                            type="button"
                            className="candidate-job-cv-settings"
                            onClick={handleToggleCvSettings}
                            aria-label={t(
                                'candidateJobDetails.cvSettings',
                            )}
                            title={t('candidateJobDetails.cvSettings')}
                        >
                            ⚙
                        </button>
                    )}
                </div>

                {showExistingCv && isCvSettingsOpen && (
                    <div className="candidate-job-cv-settings-panel">
                        <button
                            type="button"
                            className="candidate-job-cv-settings-action"
                            onClick={handleReplaceCv}
                            disabled={isDeletingCv || isUploadingCv}
                        >
                            {t('candidateJobDetails.replaceCv')}
                        </button>
                        <button
                            type="button"
                            className="candidate-job-cv-settings-action candidate-job-cv-delete-button"
                            onClick={handleOpenDeleteCvDialog}
                            disabled={isDeletingCv || isUploadingCv}
                        >
                            {isDeletingCv
                                ? t('candidateJobDetails.deletingCv')
                                : t('candidateJobDetails.deleteCv')}
                        </button>
                    </div>
                )}

                {showExistingCv &&
                    (isLoadingExistingCv ||
                        existingCvPreviewError ||
                        existingCvPreviewUrl) && (
                        <div className="candidate-job-cv-preview">
                            {isLoadingExistingCv && (
                                <div
                                    className="candidate-job-cv-preview-state"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {t('candidateJobDetails.cvLoading')}
                                </div>
                            )}

                            {!isLoadingExistingCv &&
                                existingCvPreviewError && (
                                    <div className="candidate-job-cv-preview-state candidate-job-cv-preview-error">
                                        {existingCvPreviewError}
                                    </div>
                                )}

                            {!isLoadingExistingCv &&
                                !existingCvPreviewError &&
                                existingCvPreviewUrl && (
                                    <iframe
                                        src={existingCvPreviewUrl}
                                        title={t(
                                            'candidateJobDetails.viewCv',
                                        )}
                                        className="candidate-job-cv-preview-frame"
                                    />
                                )}
                        </div>
                    )}


                {showSelectedCv && cvFile && (
                    <div
                        className={
                            selectedCvPreviewUrl && !isUploadingCv
                                ? 'candidate-job-cv-preview'
                                : 'candidate-job-cv-preview candidate-job-cv-compact-state'
                        }
                    >
                        {isUploadingCv ? (
                            <div
                                className="candidate-job-cv-preview-state candidate-job-cv-conversion-state"
                                role="status"
                                aria-live="polite"
                                aria-busy="true"
                            >
                                <LoadingSpinner />
                                <strong>
                                    {/\.docx?$/i.test(cvFile.name)
                                        ? t('candidateJobDetails.cvConverting')
                                        : t('candidateJobDetails.cvUploading')}
                                </strong>
                            </div>
                        ) : selectedCvPreviewUrl ? (
                            <iframe
                                src={selectedCvPreviewUrl}
                                title={t('candidateJobDetails.selectedCv')}
                                className="candidate-job-cv-preview-frame"
                            />
                        ) : (
                            <div className="candidate-job-cv-preview-state">
                                <strong>{cvFile.name}</strong>
                                <span>
                                    {cvRetentionConsent
                                        ? t('candidateJobDetails.cvPdfPreviewOnly')
                                        : t('candidateJobDetails.cvUploadConsentPrompt')}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {!showExistingCv && !showSelectedCv && (
                    <div className="candidate-job-cv-upload">
                        <div className="candidate-job-cv-upload-icon">
                            📄
                        </div>
                        <h3>
                            {t('candidateJobDetails.uploadYourCv')}
                        </h3>
                        <p>{t('candidateJobDetails.cvFileTypes')}</p>

                        <div className="candidate-job-cv-upload-actions">
                            <label className="candidate-job-cv-upload-button">
                                {t('candidateJobDetails.chooseFile')}
                                <input
                                    id="cv"
                                    name="cv"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(event) =>
                                        void handleCvChange(event)
                                    }
                                    disabled={
                                        isSubmitting || isUploadingCv
                                    }
                                />
                            </label>

                            {isReplacingCv && (
                                <button
                                    type="button"
                                    className="candidate-job-cv-cancel-button"
                                    onClick={cancelReplaceCv}
                                    disabled={
                                        isSubmitting || isUploadingCv
                                    }
                                >
                                    {t('common.cancel')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {cvFileError && (
                    <p
                        className="candidate-job-application-error"
                        role="alert"
                    >
                        {cvFileError}
                    </p>
                )}

                {(cvFile || !hasExistingCv || isReplacingCv) && (
                    <label className="candidate-job-application-consent">
                        <input
                            type="checkbox"
                            checked={cvRetentionConsent}
                            onChange={(event) =>
                                setCvRetentionConsent(event.target.checked)
                            }
                            disabled={isSubmitting || isUploadingCv}
                        />
                        <span>
                            {t(
                                'candidateJobDetails.cvRetentionConsent',
                            )}
                        </span>
                    </label>
                )}
            </section>

            <section
                className="candidate-job-application-card candidate-job-application-form-card"
                aria-labelledby="candidate-job-application-form-heading"
            >
                <h2 id="candidate-job-application-form-heading">
                    {t('candidateJobDetails.applyForThisJob')}
                </h2>

                <form
                    className="candidate-job-application-form"
                    onSubmit={(event) =>
                        void handleContinueToReview(event)
                    }
                >
                    <div className="candidate-job-application-field">
                        <label htmlFor="cover-letter">
                            {t('candidateJobDetails.coverLetter')}
                        </label>
                        <textarea
                            id="cover-letter"
                            name="coverLetter"
                            value={coverLetter}
                            onChange={(event) =>
                                setCoverLetter(event.target.value)
                            }
                            maxLength={2000}
                            rows={8}
                            placeholder={t(
                                'candidateJobDetails.coverLetterPlaceholder',
                            )}
                            disabled={isSubmitting || isUploadingCv}
                        />
                    </div>

                    {submitError && (
                        <p
                            className="candidate-job-application-error"
                            role="alert"
                        >
                            {submitError}
                        </p>
                    )}

                    <div className="candidate-job-application-form-actions">
                        <Link
                            to={`/jobs/${job.id}`}
                            className="candidate-job-application-secondary-button"
                        >
                            {t('candidateJobDetails.backToJobs')}
                        </Link>

                        <button
                            type="submit"
                            className="candidate-job-application-button candidate-job-application-submit"
                            disabled={
                                isSubmitting ||
                                isUploadingCv ||
                                Boolean(cvFileError)
                            }
                        >
                            {isUploadingCv ? (
                                <>
                                    <LoadingSpinner />
                                    {isReplacingCv
                                        ? t(
                                            'candidateJobDetails.replacingCv',
                                        )
                                        : cvFile &&
                                            /\.docx?$/i.test(cvFile.name)
                                            ? t(
                                                'candidateJobDetails.cvConverting',
                                            )
                                            : t(
                                                'candidateJobDetails.cvUploading',
                                            )}
                                </>
                            ) : (
                                t('candidateJobDetails.continue')
                            )}
                        </button>
                    </div>
                </form>
            </section>

            <ConfirmDialog
                open={isDeleteCvDialogOpen}
                title={t('common.confirmDeleteTitle')}
                message={t(
                    'candidateJobDetails.deleteCvConfirmation',
                )}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                destructive
                onCancel={handleCancelDeleteCv}
                onConfirm={() => void handleDeleteCv()}
            />
        </div>
    )
}
