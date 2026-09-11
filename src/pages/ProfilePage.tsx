import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import ErrorState from '../components/feedback/ErrorState'
import LoadingState from '../components/feedback/LoadingState'
import CandidateSkills from '../features/candidate/CandidateSkills'
import { useAuth } from '../features/auth/useAuth'
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
} from '../features/candidate/candidate.api'
import { useTranslation } from '../i18n/useTranslation'
import { ApiError } from '../services/api/apiError'
import type {
  CandidateProfile,
  CandidateProfileInput,
} from '../types/candidate'
import type { Language } from '../i18n'
import './ProfilePage.css'

function formatNullable(
  value: string | null,
  notSpecified: string,
) {
  return value || notSpecified
}

function formatSalary(
  min: string | null,
  max: string | null,
  currency: string | null,
  language: Language,
  upTo: string,
  from: string,
  notSpecified: string,
) {
  if ((min === null && max === null) || !currency) {
    return notSpecified
  }

  const locale = language === 'nl' ? 'nl-NL' : 'en-US'

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  if (min === null) {
    return `${upTo} ${formatter.format(Number(max))}`
  }

  if (max === null) {
    return `${from} ${formatter.format(Number(min))}`
  }

  return `${formatter.format(Number(min))} – ${formatter.format(Number(max))}`
}

function formatDate(
  value: string | null,
  language: Language,
  notSpecified: string,
) {
  if (!value) {
    return notSpecified
  }

  const locale = language === 'nl' ? 'nl-NL' : 'en-GB'

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function toInput(
  profile: CandidateProfile | null,
): CandidateProfileInput {
  if (!profile) {
    return {}
  }

  return {
    ...(profile.headline
      ? { headline: profile.headline }
      : {}),
    ...(profile.summary
      ? { summary: profile.summary }
      : {}),
    ...(profile.location
      ? { location: profile.location }
      : {}),
    ...(profile.salaryMin !== null
      ? { salaryMin: Number(profile.salaryMin) }
      : {}),
    ...(profile.salaryMax !== null
      ? { salaryMax: Number(profile.salaryMax) }
      : {}),
    ...(profile.currency
      ? { currency: profile.currency }
      : {}),
    ...(profile.availabilityDate
      ? { availabilityDate: profile.availabilityDate }
      : {}),
    ...(profile.remotePreference
      ? { remotePreference: profile.remotePreference }
      : {}),
  }
}

interface ProfileFormProps {
  value: CandidateProfileInput
  submitting: boolean
  submitLabel: string
  savingLabel: string
  cancelLabel: string
  onChange: (value: CandidateProfileInput) => void
  onSubmit: () => void
  onCancel?: () => void
}

function ProfileForm({
  value,
  submitting,
  submitLabel,
  savingLabel,
  cancelLabel,
  onChange,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const { t } = useTranslation()

  return (
    <form
      className="profile-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label>
        {t('profile.headline')}
        <input
          value={value.headline ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              headline: event.target.value,
            })
          }
        />
      </label>

      <label>
        {t('profile.summary')}
        <textarea
          value={value.summary ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              summary: event.target.value,
            })
          }
        />
      </label>

      <label>
        {t('profile.location')}
        <input
          value={value.location ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              location: event.target.value,
            })
          }
        />
      </label>

      <div className="profile-form-row">
        <label>
          {t('profile.minimumSalary')}
          <input
            type="number"
            min="0"
            value={value.salaryMin ?? ''}
            onChange={(event) =>
              onChange({
                ...value,
                salaryMin:
                  event.target.value === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
          />
        </label>

        <label>
          {t('profile.maximumSalary')}
          <input
            type="number"
            min="0"
            value={value.salaryMax ?? ''}
            onChange={(event) =>
              onChange({
                ...value,
                salaryMax:
                  event.target.value === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
          />
        </label>
      </div>

      <label>
        {t('profile.currency')}
        <input
          value={value.currency ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              currency: event.target.value,
            })
          }
          placeholder="EUR"
        />
      </label>

      <label>
        {t('profile.availabilityDate')}
        <input
          type="date"
          value={value.availabilityDate?.slice(0, 10) ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              availabilityDate:
                event.target.value || undefined,
            })
          }
        />
      </label>

      <label>
        {t('profile.remotePreference')}
        <input
          value={value.remotePreference ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              remotePreference: event.target.value,
            })
          }
          placeholder="HYBRID"
        />
      </label>

      <div className="profile-actions">
        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? savingLabel : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  )
}

function ProfilePage() {
  const { user } = useAuth()
  const { language, t } = useTranslation()

  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null)

  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formValue, setFormValue] =
    useState<CandidateProfileInput>({})
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'CANDIDATE') {
      return
    }

    let cancelled = false

    async function loadCandidateProfile() {
      setLoading(true)
      setError(null)

      try {
        const profile = await getCandidateProfile()

        if (!cancelled) {
          setCandidateProfile(profile)
          setFormValue(toInput(profile))
        }
      } catch (caught) {
        if (!cancelled) {
          if (
            caught instanceof ApiError &&
            caught.status === 404
          ) {
            setCandidateProfile(null)
            setFormValue({})
            setError(null)
          } else if (
            caught instanceof ApiError &&
            (caught.status === 401 ||
              caught.status === 403)
          ) {
            setError(t('profile.unauthorizedAccess'))
          } else if (
            caught instanceof ApiError &&
            caught.status === 500
          ) {
            setError(t('profile.serverLoadError'))
          } else if (
            caught instanceof ApiError &&
            caught.status === 0
          ) {
            setError(t('profile.connectionError'))
          } else {
            setError(t('profile.loadError'))
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCandidateProfile()

    return () => {
      cancelled = true
    }
  }, [user, retryCount, t])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const profile = candidateProfile
        ? await updateCandidateProfile(formValue)
        : await createCandidateProfile(formValue)

      setCandidateProfile(profile)
      setFormValue(toInput(profile))
      setEditing(false)

      setSuccess(
        candidateProfile
          ? t('profile.profileUpdated')
          : t('profile.profileCreated'),
      )
    } catch (caught) {
      if (
        caught instanceof ApiError &&
        (caught.status === 401 ||
          caught.status === 403)
      ) {
        setError(t('profile.unauthorizedModify'))
      } else if (
        caught instanceof ApiError &&
        caught.status === 400
      ) {
        setError(t('profile.invalidInformation'))
      } else if (
        caught instanceof ApiError &&
        caught.status === 409
      ) {
        setError(t('profile.profileAlreadyExists'))
      } else if (
        caught instanceof ApiError &&
        caught.status === 422
      ) {
        setError(t('profile.processingError'))
      } else if (
        caught instanceof ApiError &&
        caught.status === 500
      ) {
        setError(t('profile.serverError'))
      } else if (
        caught instanceof ApiError &&
        caught.status === 0
      ) {
        setError(t('profile.connectionError'))
      } else {
        setError(
          candidateProfile
            ? t('profile.updateError')
            : t('profile.createError'),
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  function startEditing() {
    setFormValue(toInput(candidateProfile))
    setError(null)
    setSuccess(null)
    setEditing(true)
  }

  function cancelEditing() {
    setFormValue(toInput(candidateProfile))
    setError(null)
    setSuccess(null)
    setEditing(false)
  }

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <p className="profile-eyebrow">IT Talent</p>

          <h1>{t('profile.title')}</h1>
        </div>

        <Link to="/dashboard">
          {t('profile.backToDashboard')}
        </Link>
      </div>

      <section
        className="profile-section"
        aria-labelledby="account-heading"
      >
        <p className="profile-eyebrow">
          {t('profile.account')}
        </p>

        <h2 id="account-heading">
          {t('profile.accountInformation')}
        </h2>

        <dl className="profile-details">
          <div>
            <dt>{t('profile.email')}</dt>
            <dd>{user?.email}</dd>
          </div>

          <div>
            <dt>{t('profile.role')}</dt>
            <dd>{user?.role}</dd>
          </div>

          <div>
            <dt>{t('profile.status')}</dt>
            <dd>{user?.status}</dd>
          </div>
        </dl>
      </section>

      {user?.role === 'CANDIDATE' && (
        <section
          className="profile-section"
          aria-labelledby="candidate-heading"
        >
          <div className="profile-section-header">
            <div>
              <p className="profile-eyebrow">
                {t('profile.candidate')}
              </p>

              <h2 id="candidate-heading">
                {candidateProfile
                  ? t('profile.candidateProfile')
                  : t('profile.createCandidateProfile')}
              </h2>
            </div>

            {!loading &&
              candidateProfile &&
              !editing && (
                <button
                  type="button"
                  onClick={startEditing}
                >
                  {t('profile.editProfile')}
                </button>
              )}
          </div>

          {loading && (
            <LoadingState message={t('profile.loading')} />
          )}

          {error && !loading && (
            <ErrorState
              title={t('profile.profileUnavailable')}
              message={error}
              onRetry={() => {
                setError(null)
                setRetryCount(
                  (current) => current + 1,
                )
              }}
            />
          )}

          {success && (
            <p role="status">{success}</p>
          )}

          {!loading && editing && (
            <ProfileForm
              value={formValue}
              submitting={submitting}
              submitLabel={t('profile.saveProfile')}
              savingLabel={t('profile.saving')}
              cancelLabel={t('profile.cancel')}
              onChange={setFormValue}
              onSubmit={() => void handleSubmit()}
              onCancel={cancelEditing}
            />
          )}

          {!loading &&
            !editing &&
            candidateProfile && (
              <>
                <dl className="profile-details">
                  <div>
                    <dt>{t('profile.headline')}</dt>
                    <dd>
                      {formatNullable(
                        candidateProfile.headline,
                        t('profile.notSpecified'),
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>{t('profile.summary')}</dt>
                    <dd>
                      {formatNullable(
                        candidateProfile.summary,
                        t('profile.notSpecified'),
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>{t('profile.location')}</dt>
                    <dd>
                      {formatNullable(
                        candidateProfile.location,
                        t('profile.notSpecified'),
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>{t('profile.salary')}</dt>
                    <dd>
                      {formatSalary(
                        candidateProfile.salaryMin,
                        candidateProfile.salaryMax,
                        candidateProfile.currency,
                        language,
                        t('profile.upTo'),
                        t('profile.from'),
                        t('profile.notSpecified'),
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>{t('profile.remotePreference')}</dt>
                    <dd>
                      {formatNullable(
                        candidateProfile.remotePreference,
                        t('profile.notSpecified'),
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>{t('profile.availability')}</dt>
                    <dd>
                      {formatDate(
                        candidateProfile.availabilityDate,
                        language,
                        t('profile.notSpecified'),
                      )}
                    </dd>
                  </div>
                </dl>

                <CandidateSkills />
              </>
            )}

          {!loading &&
            !editing &&
            !candidateProfile &&
            !error && (
              <ProfileForm
                value={formValue}
                submitting={submitting}
                submitLabel={t('profile.createProfile')}
                savingLabel={t('profile.saving')}
                cancelLabel={t('profile.cancel')}
                onChange={setFormValue}
                onSubmit={() => void handleSubmit()}
              />
            )}
        </section>
      )}
    </section>
  )
}

export default ProfilePage
