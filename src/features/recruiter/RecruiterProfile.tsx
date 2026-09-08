import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import ErrorState from '../../components/feedback/ErrorState'
import LoadingState from '../../components/feedback/LoadingState'
import {
    getRecruiterProfile,
    updateRecruiterProfile,
} from './recruiter.api'
import './RecruiterProfile.css'

function RecruiterProfile() {
    const [jobTitle, setJobTitle] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function loadProfile() {
            setIsLoading(true)
            setError(null)

            try {
                const profile = await getRecruiterProfile()

                if (!cancelled) {
                    setJobTitle(profile.jobTitle ?? '')
                }
            } catch {
                if (!cancelled) {
                    setError('Unable to load recruiter profile.')
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        void loadProfile()

        return () => {
            cancelled = true
        }
    }, [retryCount])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        try {
            setIsSaving(true)
            setError(null)
            setSuccess(null)

            const profile = await updateRecruiterProfile({
                jobTitle: jobTitle.trim(),
            })

            setJobTitle(profile.jobTitle ?? '')
            setSuccess('Recruiter profile saved.')
        } catch {
            setError('Unable to save recruiter profile.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <LoadingState message="Loading recruiter profile..." />
    }

    return (
        <section>
            <h2>Recruiter profile</h2>

            {error && (
                <ErrorState
                    title="Recruiter profile unavailable"
                    message={error}
                    onRetry={() => {
                        setError(null)
                        setRetryCount((current) => current + 1)
                    }}
                />
            )}

            {success && <p role="status">{success}</p>}

            <form onSubmit={handleSubmit}>
                <label htmlFor="recruiter-job-title">Job title</label>

                <input
                    id="recruiter-job-title"
                    type="text"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    minLength={2}
                    maxLength={150}
                    required
                    aria-invalid={Boolean(error)}
                    placeholder="e.g. Senior Recruiter"
                />

                <button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </section>
    )
}

export default RecruiterProfile
