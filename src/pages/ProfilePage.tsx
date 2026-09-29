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
import {
  getRecruiterProfile,
  updateRecruiterProfile,
} from '../features/recruiter/recruiter.api'
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
    > <label>
        {t('profile.headline')}
        <input
          value={value.headline ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              headline: event.target.value,
            })
          }
        /> </label>


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
        {t('common.location')}
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

interface RecruiterProfileFormProps {
  accountForm: {
    firstName: string
    lastName: string
  }
  jobTitle: string
  submitting: boolean
  onAccountChange: (value: {
    firstName: string
    lastName: string
  }) => void
  onJobTitleChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

function RecruiterProfileForm({
  accountForm,
  jobTitle,
  submitting,
  onAccountChange,
  onJobTitleChange,
  onSubmit,
  onCancel,
}: RecruiterProfileFormProps) {
  const { t } = useTranslation()

  return (
    <form
      className="profile-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    > <div className="profile-form-section"> <div> <p className="profile-eyebrow">
      {t('profile.account')} </p>


      <h2>
        {t('profile.accountInformation')}
      </h2>
    </div>

        <div className="profile-form-row">
          <label>
            {t('profile.firstName')}
            <input
              value={accountForm.firstName}
              onChange={(event) =>
                onAccountChange({
                  ...accountForm,
                  firstName: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            {t('profile.lastName')}
            <input
              value={accountForm.lastName}
              onChange={(event) =>
                onAccountChange({
                  ...accountForm,
                  lastName: event.target.value,
                })
              }
              required
            />
          </label>
        </div>
      </div>

      <div className="profile-form-section">
        <div>
          <p className="profile-eyebrow">
            {t('common.recruiter')}
          </p>

          <h2>
            {t('profile.recruiterInformation')}
          </h2>
        </div>

        <label>
          {t('profile.jobTitle')}
          <input
            id="recruiter-job-title"
            type="text"
            value={jobTitle}
            onChange={(event) =>
              onJobTitleChange(event.target.value)
            }
            minLength={2}
            maxLength={150}
            required
            placeholder={t('profile.jobTitlePlaceholder')}
          />
        </label>
      </div>

      <div className="profile-actions">
        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? t('profile.saving')
            : t('profile.saveProfile')}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>

  )
}

function ProfilePage() {
  const { user, updateUser } = useAuth()
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

  const [editingProfile, setEditingProfile] =
    useState(false)
  const [profileSubmitting, setProfileSubmitting] =
    useState(false)

  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  })

  const [jobTitle, setJobTitle] = useState('')
  const [recruiterLoading, setRecruiterLoading] =
    useState(false)
  const [recruiterError, setRecruiterError] =
    useState<string | null>(null)
  const [recruiterRetryCount, setRecruiterRetryCount] =
    useState(0)

  useEffect(() => {
    setAccountForm({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    })
  }, [user])

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

  useEffect(() => {
    if (!user || user.role !== 'RECRUITER') {
      return
    }

    let cancelled = false

    async function loadRecruiterProfile() {
      setRecruiterLoading(true)
      setRecruiterError(null)

      try {
        const profile = await getRecruiterProfile()

        if (!cancelled) {
          setJobTitle(profile.jobTitle ?? '')
        }
      } catch {
        if (!cancelled) {
          setRecruiterError(
            t('profile.recruiterLoadError'),
          )
        }
      } finally {
        if (!cancelled) {
          setRecruiterLoading(false)
        }
      }
    }

    void loadRecruiterProfile()

    return () => {
      cancelled = true
    }


  }, [user, recruiterRetryCount, t])

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

  async function handleProfileSubmit() {
    setProfileSubmitting(true)
    setError(null)
    setSuccess(null)


    try {
      await updateUser(
        accountForm.firstName,
        accountForm.lastName,
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
        setError(t('profile.invalidAccountInformation'))
      } else {
        setError(t('profile.accountUpdateError'))
      }

      setProfileSubmitting(false)
      return
    }

    if (user?.role === 'RECRUITER') {
      try {
        const profile = await updateRecruiterProfile({
          jobTitle: jobTitle.trim(),
        })

        setJobTitle(profile.jobTitle ?? '')
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
          setError(t('profile.invalidAccountInformation'))
        } else {
          setError(t('profile.recruiterUpdateError'))
        }

        setProfileSubmitting(false)
        return
      }
    }

    setEditingProfile(false)
    setSuccess(t('profile.profileUpdated'))
    setProfileSubmitting(false)


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

  function startProfileEditing() {
    setAccountForm({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    })

    setError(null)
    setSuccess(null)
    setEditingProfile(true)

  }

  function cancelProfileEditing() {
    setAccountForm({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    })

    setError(null)
    setSuccess(null)
    setEditingProfile(false)

  }

  return (<section className="profile-page"> <div className="profile-header"> <div> <p className="profile-eyebrow">IT Talent</p>

    <h1>{t('profile.title')}</h1>
  </div>

    <Link to="/dashboard">
      {t('common.backToDashboard')}
    </Link>
  </div>

    {success && (
      <p role="status">{success}</p>
    )}

    {user?.role === 'RECRUITER' ? (
      <section
        className="profile-section"
        aria-labelledby="account-heading"
      >
        {!editingProfile && (
          <div className="profile-section-header">
            <div>
              <p className="profile-eyebrow">
                {t('profile.account')}
              </p>

              <h2 id="account-heading">
                {t('profile.accountInformation')}
              </h2>
            </div>

            {!recruiterLoading &&
              !recruiterError && (
                <button
                  type="button"
                  onClick={startProfileEditing}
                >
                  {t('profile.editProfile')}
                </button>
              )}
          </div>
        )}

        {recruiterLoading && (
          <LoadingState
            message={t('profile.recruiterLoading')}
          />
        )}

        {recruiterError && !recruiterLoading && (
          <ErrorState
            title={t('profile.recruiterUnavailable')}
            message={recruiterError}
            onRetry={() => {
              setRecruiterError(null)
              setRecruiterRetryCount(
                (current) => current + 1,
              )
            }}
          />
        )}

        {editingProfile &&
          !recruiterLoading &&
          !recruiterError && (
            <RecruiterProfileForm
              accountForm={accountForm}
              jobTitle={jobTitle}
              submitting={profileSubmitting}
              onAccountChange={setAccountForm}
              onJobTitleChange={setJobTitle}
              onSubmit={() =>
                void handleProfileSubmit()
              }
              onCancel={cancelProfileEditing}
            />
          )}

        {!editingProfile &&
          !recruiterLoading &&
          !recruiterError && (
            <>
              <dl className="profile-details">
                <div>
                  <dt>{t('profile.firstName')}</dt>
                  <dd>{user?.firstName}</dd>
                </div>

                <div>
                  <dt>{t('profile.lastName')}</dt>
                  <dd>{user?.lastName}</dd>
                </div>

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

              <div className="profile-subsection">
                <div>
                  <p className="profile-eyebrow">
                    {t('common.recruiter')}
                  </p>

                  <h2>
                    {t('profile.recruiterInformation')}
                  </h2>
                </div>

                <dl className="profile-details">
                  <div>
                    <dt>{t('profile.jobTitle')}</dt>
                    <dd>
                      {formatNullable(
                        jobTitle || null,
                        t('profile.notSpecified'),
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
      </section>
    ) : (
      <section
        className="profile-section"
        aria-labelledby="account-heading"
      >
        <div className="profile-section-header">
          <div>
            <p className="profile-eyebrow">
              {t('profile.account')}
            </p>

            <h2 id="account-heading">
              {t('profile.accountInformation')}
            </h2>
          </div>

          {!editingProfile && (
            <button
              type="button"
              onClick={startProfileEditing}
            >
              {t('profile.editProfile')}
            </button>
          )}
        </div>

        {editingProfile ? (
          <form
            className="profile-form"
            onSubmit={(event) => {
              event.preventDefault()
              void handleProfileSubmit()
            }}
          >
            <label>
              {t('profile.firstName')}
              <input
                value={accountForm.firstName}
                onChange={(event) =>
                  setAccountForm({
                    ...accountForm,
                    firstName: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              {t('profile.lastName')}
              <input
                value={accountForm.lastName}
                onChange={(event) =>
                  setAccountForm({
                    ...accountForm,
                    lastName: event.target.value,
                  })
                }
                required
              />
            </label>

            <div className="profile-actions">
              <button
                type="submit"
                disabled={profileSubmitting}
              >
                {profileSubmitting
                  ? t('profile.saving')
                  : t('profile.saveProfile')}
              </button>

              <button
                type="button"
                onClick={cancelProfileEditing}
                disabled={profileSubmitting}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <dl className="profile-details">
            <div>
              <dt>{t('profile.firstName')}</dt>
              <dd>{user?.firstName}</dd>
            </div>

            <div>
              <dt>{t('profile.lastName')}</dt>
              <dd>{user?.lastName}</dd>
            </div>

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
        )}

        {user?.role !== 'CANDIDATE' && error && (
          <ErrorState
            title={t('profile.profileUnavailable')}
            message={error}
            onRetry={() => setError(null)}
          />
        )}
      </section>
    )}

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

        {!loading && editing && (
          <ProfileForm
            value={formValue}
            submitting={submitting}
            submitLabel={t('profile.saveProfile')}
            savingLabel={t('profile.saving')}
            cancelLabel={t('common.cancel')}
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
                  <dt>{t('common.location')}</dt>
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
              cancelLabel={t('common.cancel')}
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
