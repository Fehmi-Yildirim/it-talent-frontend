
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import ErrorState from '../components/feedback/ErrorState'
import LoadingState from '../components/feedback/LoadingState'
import { useTranslation } from '../i18n/useTranslation'
import { ApiError } from '../services/api/apiError'
import { apiClient } from '../services/api/apiClient'
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

type CompanyField = 'name' | 'description' | 'website' | 'location'

type CompanyErrors = Partial<Record<CompanyField, string>>

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
    const [errors, setErrors] = useState<CompanyErrors>({})
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
                    setErrors({})
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

    function validateField(
        field: CompanyField,
        value: string,
    ): string | undefined {
        const trimmedValue = value.trim()

        switch (field) {
            case 'name':
                if (!trimmedValue) {
                    return t('companyManagement.validationNameRequired')
                }

                if (trimmedValue.length < 2) {
                    return t('companyManagement.validationNameMinLength')
                }

                if (trimmedValue.length > 150) {
                    return t('companyManagement.validationNameMaxLength')
                }
                break

            case 'description':
                if (!trimmedValue) {
                    return t('companyManagement.validationDescriptionRequired')
                }

                if (trimmedValue.length < 2) {
                    return t('companyManagement.validationDescriptionMinLength')
                }

                if (trimmedValue.length > 255) {
                    return t('companyManagement.validationDescriptionMaxLength')
                }
                break

            case 'website':
                if (!trimmedValue) {
                    return t('companyManagement.validationWebsiteRequired')
                }

                try {
                    const url = new URL(trimmedValue)

                    if (
                        url.protocol !== 'http:' &&
                        url.protocol !== 'https:'
                    ) {
                        throw new Error('Invalid URL protocol')
                    }
                } catch {
                    return t('companyManagement.validationWebsite')
                }
                break

            case 'location':
                if (!trimmedValue) {
                    return t('companyManagement.validationLocationRequired')
                }

                if (trimmedValue.length > 255) {
                    return t('companyManagement.validationLocationMaxLength')
                }
                break
        }

        return undefined
    }

    function validateForm(): boolean {
        const values: Record<CompanyField, string> = {
            name,
            description,
            website,
            location,
        }

        const nextErrors: CompanyErrors = {}

            ; (Object.keys(values) as CompanyField[]).forEach((field) => {
                const message = validateField(field, values[field])

                if (message) {
                    nextErrors[field] = message
                }
            })

        setErrors(nextErrors)

        return Object.keys(nextErrors).length === 0
    }

    function handleFieldChange(field: CompanyField, value: string) {
        switch (field) {
            case 'name':
                setName(value)
                break
            case 'description':
                setDescription(value)
                break
            case 'website':
                setWebsite(value)
                break
            case 'location':
                setLocation(value)
                break
        }

        setErrors((current) => {
            if (!(field in current)) {
                return current
            }

            return {
                ...current,
                [field]: undefined,
            }
        })
    }

    function handleFieldBlur(field: CompanyField, value: string) {
        const message = validateField(field, value)

        setErrors((current) => ({
            ...current,
            [field]: message,
        }))
    }

    function renderFieldError(field: CompanyField, value: string) {
        const message = errors[field]

        if (!message) {
            return null
        }

        if (!value.trim()) {
            return (
                <span id={`company-${field}-error`} className="sr-only">
                    {message}
                </span>
            )
        }

        return (
            <p
                id={`company-${field}-error`}
                className="form-field-error"
                role="alert"
            >
                {message}
            </p>
        )
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setError(null)
        setSuccess(null)

        if (!validateForm()) {
            return
        }

        const input: CompanyInput = {
            name: name.trim(),
            description: description.trim(),
            website: website.trim(),
            location: location.trim(),
        }

        try {
            setIsSaving(true)

            const data = company
                ? await apiClient.patch<Company>('/companies/me', input)
                : await apiClient.post<Company>('/companies', input)

            setCompany(data)
            setName(data.name)
            setDescription(data.description)
            setWebsite(data.website ?? '')
            setLocation(data.location ?? '')
            setErrors({})
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

    const backLink = (
        <Link to="/dashboard" className="back-link">
            {t('common.backToDashboard')}
        </Link>
    )

    if (isLoading) {
        return (
            <div className="company-page">
                {backLink}
                <LoadingState message={t('companyManagement.loading')} />
            </div>
        )
    }

    if (!company && !isCreating) {
        if (error) {
            return (
                <div className="company-page">
                    {backLink}

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
                </div>
            )
        }

        return (
            <div className="company-page">
                {backLink}

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
            </div>
        )
    }

    return (
        <div className="company-page">
            {backLink}

            <section className="company-management">
                <h2>
                    {company
                        ? t('companyManagement.information')
                        : t('companyManagement.createCompany')}
                </h2>

                {error && (
                    <ErrorState
                        title={
                            company
                                ? t('companyManagement.saveError')
                                : t('companyManagement.createError')
                        }
                        message={error}
                    />
                )}

                {success && (
                    <p className="company-management__success" role="status">
                        {success}
                    </p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="company-management__field">
                        <label htmlFor="company-name">
                            {t('companyManagement.name')}
                        </label>

                        <input
                            id="company-name"
                            type="text"
                            className={`form-control ${errors.name ? 'form-control--invalid' : ''}`}
                            value={name}
                            placeholder={
                                errors.name && !name.trim() ? errors.name : ''
                            }
                            onChange={(event) =>
                                handleFieldChange('name', event.target.value)
                            }
                            onBlur={() => handleFieldBlur('name', name)}
                            maxLength={150}
                            required
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={
                                errors.name ? 'company-name-error' : undefined
                            }
                        />

                        {renderFieldError('name', name)}
                    </div>

                    <div className="company-management__field">
                        <label htmlFor="company-description">
                            {t('companyManagement.description')}
                        </label>

                        <textarea
                            id="company-description"
                            className={`form-control ${errors.description ? 'form-control--invalid' : ''}`}
                            value={description}
                            placeholder={
                                errors.description && !description.trim()
                                    ? errors.description
                                    : ''
                            }
                            onChange={(event) =>
                                handleFieldChange(
                                    'description',
                                    event.target.value,
                                )
                            }
                            onBlur={() =>
                                handleFieldBlur('description', description)
                            }
                            maxLength={255}
                            rows={5}
                            required
                            aria-invalid={Boolean(errors.description)}
                            aria-describedby={
                                errors.description
                                    ? 'company-description-error'
                                    : undefined
                            }
                        />

                        {renderFieldError('description', description)}
                    </div>

                    <div className="company-management__field">
                        <label htmlFor="company-website">
                            {t('companyManagement.website')}
                        </label>

                        <input
                            id="company-website"
                            type="url"
                            required
                            className={`form-control ${errors.website ? 'form-control--invalid' : ''}`}
                            value={website}
                            placeholder={
                                errors.website && !website.trim()
                                    ? errors.website
                                    : ''
                            }
                            onChange={(event) =>
                                handleFieldChange('website', event.target.value)
                            }
                            onBlur={() => handleFieldBlur('website', website)}
                            maxLength={255}
                            aria-invalid={Boolean(errors.website)}
                            aria-describedby={
                                errors.website
                                    ? 'company-website-error'
                                    : undefined
                            }
                        />

                        {renderFieldError('website', website)}
                    </div>

                    <div className="company-management__field">
                        <label htmlFor="company-location">
                            {t('companyManagement.location')}
                        </label>

                        <input
                            id="company-location"
                            type="text"
                            required
                            className={`form-control ${errors.location ? 'form-control--invalid' : ''}`}
                            value={location}
                            placeholder={
                                errors.location && !location.trim()
                                    ? errors.location
                                    : ''
                            }
                            onChange={(event) =>
                                handleFieldChange('location', event.target.value)
                            }
                            onBlur={() => handleFieldBlur('location', location)}
                            maxLength={255}
                            aria-invalid={Boolean(errors.location)}
                            aria-describedby={
                                errors.location
                                    ? 'company-location-error'
                                    : undefined
                            }
                        />

                        {renderFieldError('location', location)}
                    </div>

                    {company && (
                        <div className="company-management__meta">
                            <span>{t('companyManagement.createdAt')}</span>
                            <p>
                                {new Date(company.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        timeZone: 'UTC',
                                    },
                                )}
                            </p>
                        </div>
                    )}

                    <div className="company-form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSaving}
                        >
                            {isSaving
                                ? t('companyManagement.saving')
                                : t('companyManagement.save')}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default CompanyManagement
