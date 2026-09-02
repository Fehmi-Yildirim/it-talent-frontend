import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
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

    useEffect(() => {
        async function loadProfile() {
            try {
                setError(null)

                const profile = await getRecruiterProfile()
                setJobTitle(profile.jobTitle ?? '')
            } catch {
                setError('Recruiterprofiel kon niet worden geladen.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadProfile()
    }, [])

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
            setSuccess('Recruiterprofiel opgeslagen.')
        } catch {
            setError('Recruiterprofiel kon niet worden opgeslagen.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <p>Recruiterprofiel laden...</p>
    }

    return (
        <section>
            <h2>Recruiterprofiel</h2>

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}

            <form onSubmit={handleSubmit}>
                <label htmlFor="recruiter-job-title">Functietitel</label>

                <input
                    id="recruiter-job-title"
                    type="text"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    maxLength={150}
                    placeholder="Bijv. Senior Recruiter"
                />

                <button type="submit" disabled={isSaving}>
                    {isSaving ? 'Opslaan...' : 'Opslaan'}
                </button>
            </form>
        </section>
    )
}

export default RecruiterProfile