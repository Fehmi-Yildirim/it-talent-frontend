import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
} from '../features/candidate/candidate.api'
import { ApiError } from '../services/api/apiError'
import type {
  CandidateProfile,
  CandidateProfileInput,
} from '../types/candidate'
import './ProfilePage.css'
import CandidateSkills from '../features/candidate/CandidateSkills'

function formatNullable(value: string | null) {
  return value || 'Not specified'
}

function formatSalary(
  min: string | null,
  max: string | null,
  currency: string | null,
) {
  if ((min === null && max === null) || !currency) {
    return 'Not specified'
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  if (min === null) {
    return `Up to ${formatter.format(Number(max))}`
  }

  if (max === null) {
    return `From ${formatter.format(Number(min))}`
  }

  return `${formatter.format(Number(min))} – ${formatter.format(Number(max))}`
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not specified'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function toInput(profile: CandidateProfile | null): CandidateProfileInput {
  if (!profile) {
    return {}
  }

  return {
    ...(profile.headline ? { headline: profile.headline } : {}),
    ...(profile.summary ? { summary: profile.summary } : {}),
    ...(profile.location ? { location: profile.location } : {}),
    ...(profile.salaryMin !== null
      ? { salaryMin: Number(profile.salaryMin) }
      : {}),
    ...(profile.salaryMax !== null
      ? { salaryMax: Number(profile.salaryMax) }
      : {}),
    ...(profile.currency ? { currency: profile.currency } : {}),
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
  onChange: (value: CandidateProfileInput) => void
  onSubmit: () => void
  onCancel?: () => void
}

function ProfileForm({
  value,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  return (
    <form
      className="profile-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label>
        Headline
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
        Summary
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
        Location
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
          Minimum salary
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
          Maximum salary
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
        Currency
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
        Availability date
        <input
          type="date"
          value={value.availabilityDate?.slice(0, 10) ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              availabilityDate: event.target.value || undefined,
            })
          }
        />
      </label>

      <label>
        Remote preference
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function ProfilePage() {
  const { user } = useAuth()

  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null)

  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formValue, setFormValue] = useState<CandidateProfileInput>({})

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
          if (caught instanceof ApiError && caught.status === 404) {
            setCandidateProfile(null)
            setFormValue({})
          } else {
            setError('Unable to load your candidate profile.')
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
  }, [user])

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
          ? 'Profile updated successfully.'
          : 'Profile created successfully.',
      )
    } catch {
      setError(
        candidateProfile
          ? 'Unable to update your candidate profile.'
          : 'Unable to create your candidate profile.',
      )
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
          <h1>Profile</h1>
        </div>

        <Link to="/dashboard">Back to dashboard</Link>
      </div>

      <section
        className="profile-section"
        aria-labelledby="account-heading"
      >
        <p className="profile-eyebrow">Account</p>

        <h2 id="account-heading">Account information</h2>

        <dl className="profile-details">
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>

          <div>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
          </div>

          <div>
            <dt>Status</dt>
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
              <p className="profile-eyebrow">Candidate</p>

              <h2 id="candidate-heading">
                {candidateProfile
                  ? 'Candidate profile'
                  : 'Create candidate profile'}
              </h2>
            </div>

            {!loading && candidateProfile && !editing && (
              <button type="button" onClick={startEditing}>
                Edit profile
              </button>
            )}
          </div>

          {loading && (
            <p role="status" aria-live="polite">
              Loading candidate profile...
            </p>
          )}

          {error && <p role="alert">{error}</p>}

          {success && <p role="status">{success}</p>}

          {!loading && editing && (
            <ProfileForm
              value={formValue}
              submitting={submitting}
              submitLabel="Save profile"
              onChange={setFormValue}
              onSubmit={() => void handleSubmit()}
              onCancel={cancelEditing}
            />
          )}

          {!loading && !editing && candidateProfile && (
            <>
              <dl className="profile-details">
                <div>
                  <dt>Headline</dt>
                  <dd>{formatNullable(candidateProfile.headline)}</dd>
                </div>

                <div>
                  <dt>Summary</dt>
                  <dd>{formatNullable(candidateProfile.summary)}</dd>
                </div>

                <div>
                  <dt>Location</dt>
                  <dd>{formatNullable(candidateProfile.location)}</dd>
                </div>

                <div>
                  <dt>Salary</dt>
                  <dd>
                    {formatSalary(
                      candidateProfile.salaryMin,
                      candidateProfile.salaryMax,
                      candidateProfile.currency,
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Remote preference</dt>
                  <dd>
                    {formatNullable(candidateProfile.remotePreference)}
                  </dd>
                </div>

                <div>
                  <dt>Availability</dt>
                  <dd>{formatDate(candidateProfile.availabilityDate)}</dd>
                </div>
              </dl>

              <CandidateSkills />
            </>
          )}

          {!loading && !editing && !candidateProfile && !error && (
            <ProfileForm
              value={formValue}
              submitting={submitting}
              submitLabel="Create profile"
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
