import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { apiClient } from '../../services/api/apiClient'

interface Company {
    id: string
    name: string
    slug: string
    website: string | null
    description: string
    location: string | null
    createdAt: string
    updatedAt: string
}

interface CompanyInput {
    name: string
    description: string
}

function CompanyManagement() {
    const [company, setCompany] = useState<Company | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        async function loadCompany() {
            try {
                setError(null)

                const data = await apiClient.get<Company>('/companies/me')

                setCompany(data)
                setName(data.name)
                setDescription(data.description)
            } catch {
                setCompany(null)
            } finally {
                setIsLoading(false)
            }
        }

        void loadCompany()
    }, [])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const input: CompanyInput = {
            name: name.trim(),
            description: description.trim(),
        }

        try {
            setIsSaving(true)
            setError(null)
            setSuccess(null)

            const data = company
                ? await apiClient.patch<Company>('/companies/me', input)
                : await apiClient.post<Company>('/companies', input)

            setCompany(data)
            setName(data.name)
            setDescription(data.description)
            setIsCreating(false)
            setSuccess(
                company
                    ? 'Bedrijfsgegevens opgeslagen.'
                    : 'Bedrijf succesvol aangemaakt.',
            )
        } catch {
            setError(
                company
                    ? 'Bedrijfsgegevens konden niet worden opgeslagen.'
                    : 'Bedrijf kon niet worden aangemaakt.',
            )
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <p>Bedrijfsgegevens laden...</p>
    }

    if (!company && !isCreating) {
        return (
            <section>
                <h2>Bedrijf</h2>
                <p>Je bent nog niet gekoppeld aan een bedrijf.</p>

                <button type="button" onClick={() => setIsCreating(true)}>
                    Bedrijf aanmaken
                </button>
            </section>
        )
    }

    return (
        <section>
            <h2>{company ? 'Bedrijfsgegevens' : 'Bedrijf aanmaken'}</h2>

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="company-name">Bedrijfsnaam</label>
                    <input
                        id="company-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        minLength={2}
                        maxLength={150}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="company-description">Beschrijving</label>
                    <textarea
                        id="company-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        minLength={2}
                        maxLength={255}
                        rows={5}
                        required
                    />
                </div>

                <button type="submit" disabled={isSaving}>
                    {isSaving ? 'Opslaan...' : company ? 'Opslaan' : 'Bedrijf aanmaken'}
                </button>
            </form>
        </section>
    )
}

export default CompanyManagement