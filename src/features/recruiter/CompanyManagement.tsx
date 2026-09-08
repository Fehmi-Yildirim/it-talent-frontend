import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import ErrorState from '../../components/feedback/ErrorState'
import LoadingState from '../../components/feedback/LoadingState'
import { ApiError } from '../../services/api/apiError'
import { apiClient } from '../../services/api/apiClient'
import './CompanyManagement.css'

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
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function loadCompany() {
            setIsLoading(true)
            setError(null)

            try {
                const data = await apiClient.get<Company>('/companies/me')

                if (!cancelled) {
                    setCompany(data)
                    setName(data.name)
                    setDescription(data.description)
                }
            } catch (caught) {
                if (!cancelled) {
                    setCompany(null)

                    if (caught instanceof ApiError) {
                        if (caught.status === 404) {
                            setError(null)
                        } else if (
                            caught.status === 401 ||
                            caught.status === 403
                        ) {
                            setError(
                                'You are not authorized to access company information.',
                            )
                        } else if (caught.status === 500) {
                            setError(
                                'The server encountered an error while loading company information.',
                            )
                        } else if (caught.status === 0) {
                            setError(
                                'Unable to connect to the server. Please check your connection and try again.',
                            )
                        } else {
                            setError(
                                'Unable to load company information.',
                            )
                        }
                    } else {
                        setError(
                            'Unable to load company information.',
                        )
                    }
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        void loadCompany()

        return () => {
            cancelled = true
        }
    }, [retryCount])

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
                ? await apiClient.patch<Company>(
                    '/companies/me',
                    input,
                )
                : await apiClient.post<Company>(
                    '/companies',
                    input,
                )

            setCompany(data)
            setName(data.name)
            setDescription(data.description)
            setIsCreating(false)

            setSuccess(
                company
                    ? 'Company information saved successfully.'
                    : 'Company created successfully.',
            )
        } catch (caught) {
            if (caught instanceof ApiError) {
                if (
                    caught.status === 401 ||
                    caught.status === 403
                ) {
                    setError(
                        'You are not authorized to modify company information.',
                    )
                } else if (caught.status === 400) {
                    setError(
                        'Please check the company information and try again.',
                    )
                } else if (caught.status === 409) {
                    setError(
                        'A company with this information already exists.',
                    )
                } else if (caught.status === 422) {
                    setError(
                        'The company information could not be processed. Please check your input.',
                    )
                } else if (caught.status === 500) {
                    setError(
                        'The server encountered an error. Please try again later.',
                    )
                } else if (caught.status === 0) {
                    setError(
                        'Unable to connect to the server. Please check your connection and try again.',
                    )
                } else {
                    setError(
                        company
                            ? 'Unable to save company information.'
                            : 'Unable to create company.',
                    )
                }
            } else {
                setError(
                    company
                        ? 'Unable to save company information.'
                        : 'Unable to create company.',
                )
            }
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <LoadingState message="Loading company information..." />
        )
    }

    if (!company && !isCreating) {
        if (error) {
            return (
                <section>
                    <h2>Company</h2>

                    <ErrorState
                        title="Company information unavailable"
                        message={error}
                        onRetry={() => {
                            setError(null)
                            setRetryCount((current) => current + 1)
                        }}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setError(null)
                            setIsCreating(true)
                        }}
                    >
                        Create company
                    </button>
                </section>
            )
        }

        return (
            <section>
                <h2>Company</h2>

                <p>
                    You are not currently connected to a company.
                </p>

                <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                >
                    Create company
                </button>
            </section>
        )
    }

    return (
        <section>
            <h2>
                {company
                    ? 'Company information'
                    : 'Create company'}
            </h2>

            {error && (
                <ErrorState
                    title="Unable to save company"
                    message={error}
                />
            )}

            {success && (
                <p role="status">{success}</p>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="company-name">
                        Company name
                    </label>

                    <input
                        id="company-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        minLength={2}
                        maxLength={150}
                        required
                        aria-invalid={Boolean(error)}
                    />
                </div>

                <div>
                    <label htmlFor="company-description">
                        Description
                    </label>

                    <textarea
                        id="company-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        minLength={2}
                        maxLength={255}
                        rows={5}
                        required
                        aria-invalid={Boolean(error)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                >
                    {isSaving
                        ? 'Saving...'
                        : company
                            ? 'Save'
                            : 'Create company'}
                </button>
            </form>
        </section>
    )
}

export default CompanyManagement
