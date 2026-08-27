import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { getCandidateProfile } from '../features/candidate/candidate.api'
import type { CandidateProfile } from '../types/candidate'
import './ProfilePage.css'

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

function ProfilePage() {
    const { user } = useAuth()

    const [candidateProfile, setCandidateProfile] =
        useState<CandidateProfile | null>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
                }
            } catch {
                if (!cancelled) {
                    setError('Unable to load your candidate profile.')
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

    return (
        <section className="profile-page">
            <div className="profile-header">
                <div>
                    <p className="profile-eyebrow">IT Talent</p>
                    <h1>Profile</h1>
                </div>

                <Link to="/dashboard">
                    Back to dashboard
                </Link>
            </div>

            <section
                className="profile-section"
                aria-labelledby="account-heading"
            >
                <p className="profile-eyebrow">Account</p>

                <h2 id="account-heading">
                    Account information
                </h2>

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
                    <p className="profile-eyebrow">
                        Candidate
                    </p>

                    <h2 id="candidate-heading">
                        Candidate profile
                    </h2>

                    {loading && (
                        <p role="status" aria-live="polite">
                            Loading candidate profile...
                        </p>
                    )}

                    {error && (
                        <p role="alert">
                            {error}
                        </p>
                    )}

                    {!loading && !error && candidateProfile && (
                        <dl className="profile-details">
                            <div>
                                <dt>Headline</dt>
                                <dd>
                                    {candidateProfile.headline}
                                </dd>
                            </div>

                            <div>
                                <dt>Summary</dt>
                                <dd>
                                    {candidateProfile.summary}
                                </dd>
                            </div>

                            <div>
                                <dt>Location</dt>
                                <dd>
                                    {candidateProfile.location}
                                </dd>
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
                                    {candidateProfile.remotePreference}
                                </dd>
                            </div>

                            <div>
                                <dt>Availability</dt>
                                <dd>
                                    {formatDate(
                                        candidateProfile.availabilityDate,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    )}

                    {!loading && !error && !candidateProfile && (
                        <p role="status">
                            No candidate profile information is available.
                        </p>
                    )}
                </section>
            )}
        </section>
    )
}

export default ProfilePage
