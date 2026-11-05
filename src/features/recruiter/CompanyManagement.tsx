
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import ErrorState from '../../components/feedback/ErrorState'
import LoadingState from '../../components/feedback/LoadingState'
import { useTranslation } from '../../i18n/useTranslation'
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
    website: string
    location: string
}

function CompanyManagement() {
    const { t } = useTranslation()
    const [company, setCompany] = useState<Company | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [website, setWebsite] = useState('')
    const [location, setLocation] = useState('')
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
                    setWebsite(data.website ?? '')
                    setLocation(data.location ?? '')
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
                            setError(t('companyManagement.unauthorizedRead'))
                        } else if (caught.status === 500) {
                            setError(t('companyManagement.serverLoadError'))
                        } else if (caught.status === 0) {
                            setError(t('companyManagement.connectionError'))
                        } else {
                            setError(t('companyManagement.loadError'))
                        }
                    } else {
                        setError(t('companyManagement.loadError'))
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
    }, [retryCount, t])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const input: CompanyInput = {
            name: name.trim(),
            description: description.trim(),
            website: website.trim(),
            location: location.trim(),
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
            setWebsite(data.website ?? '')
            setLocation(data.location ?? '')
            setIsCreating(false)

            setSuccess(
                company
                    ? t('companyManagement.saveSuccess')
                    : t('companyManagement.createSuccess'),
            )
        } catch (caught) {
            if (caught instanceof ApiError) {
                if (caught.status === 401 || caught.status === 403) {
                    setError(t('companyManagement.unauthorizedModify'))
                } else if (caught.status === 400) {
                    setError(t('companyManagement.validationError'))
                } else if (caught.status === 409) {
                    setError(t('companyManagement.existsError'))
                } else if (caught.status === 422) {
                    setError(t('companyManagement.processError'))
                } else if (caught.status === 500) {
                    setError(t('companyManagement.serverSaveError'))
                } else if (caught.status === 0) {
                    setError(t('companyManagement.connectionError'))
                } else {
                    setError(
                        company
                            ? t('companyManagement.saveError')
                            : t('companyManagement.createError'),
                    )
                }
            } else {
                setError(
                    company
                        ? t('companyManagement.saveError')
                        : t('companyManagement.createError'),
                )
            }
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <LoadingState message={t('companyManagement.loading')} />
    }

    if (!company && !isCreating) {
        if (error) {
            return (
                <section className="company-management">
                    <h2>{t('companyManagement.title')}</h2>

                    <ErrorState
                        title={t('companyManagement.unavailable')}
                        message={error}
                        onRetry={() => {
                            setError(null)
                            setRetryCount((current) => current + 1)
                        }}
                    />

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            setError(null)
                            setIsCreating(true)
                        }}
                    >
                        {t('companyManagement.createCompany')}
                    </button>
                </section>
            )
        }

        return (
            <section className="company-management">
                <h2>{t('companyManagement.title')}</h2>

                <p>{t('companyManagement.noCompany')}</p>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsCreating(true)}
                >
                    {t('companyManagement.createCompany')}
                </button>
            </section>
        )
    }

    return (
        <section className="company-management">
            <h2>
                {company
                    ? t('companyManagement.information')
                    : t('companyManagement.createCompany')}
            </h2>

            {error && (
                <ErrorState
                    title={t('companyManagement.saveError')}
                    message={error}
                />
            )}

            {success && (
                <p className="company-management__success" role="status">
                    {success}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div className="company-management__field">
                    <label htmlFor="company-name">
                        {t('companyManagement.name')}
                    </label>
                    <input
                        id="company-name"
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        minLength={2}
                        maxLength={150}
                        required
                        aria-invalid={Boolean(error)}
                    />
                </div>

                <div className="company-management__field">
                    <label htmlFor="company-description">
                        {t('companyManagement.description')}
                    </label>
                    <textarea
                        id="company-description"
                        className="form-control"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        minLength={2}
                        maxLength={255}
                        rows={5}
                        required
                        aria-invalid={Boolean(error)}
                    />
                </div>

                <div className="company-management__field">
                    <label htmlFor="company-website">
                        {t('companyManagement.website')}
                    </label>
                    <input
                        id="company-website"
                        type="url"
                        className="form-control"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        maxLength={255}
                        aria-invalid={Boolean(error)}
                    />
                </div>

                <div className="company-management__field">
                    <label htmlFor="company-location">
                        {t('companyManagement.location')}
                    </label>
                    <input
                        id="company-location"
                        type="text"
                        className="form-control"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        maxLength={255}
                        aria-invalid={Boolean(error)}
                    />
                </div>

                {company && (
                    <div className="company-management__meta">
                        <span>{t('companyManagement.createdAt')}</span>
                        <p>
                            {new Date(company.createdAt).toLocaleDateString(
                                undefined,
                                { timeZone: 'UTC' },
                            )}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSaving}
                >
                    {isSaving
                        ? t('companyManagement.saving')
                        : company
                            ? t('companyManagement.save')
                            : t('companyManagement.createCompany')}
                </button>
            </form>
        </section>
    )
}

export default CompanyManagement
