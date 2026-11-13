
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../features/auth/auth.api'
import { useTranslation } from '../i18n/useTranslation'
import {
  email as emailValidator,
  maxLength,
  minLength,
  required,
  validate,
} from '../validation/validators'
import type { ValidationError } from '../validation/validationTypes'
import './RegisterPage.css'
import { USER_ROLES } from '../types/user'

type RegistrationRole =
  | typeof USER_ROLES.CANDIDATE
  | typeof USER_ROLES.RECRUITER

function RegisterPage() {
  const { t } = useTranslation()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RegistrationRole>(
    USER_ROLES.CANDIDATE,
  )
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationComplete, setRegistrationComplete] =
    useState(false)

  function getValidationMessage(
    validationError: ValidationError,
    field: 'firstName' | 'lastName' | 'email' | 'password',
  ): string {
    switch (validationError.code) {
      case 'required':
        if (field === 'firstName') return t('auth.firstNameRequired')
        if (field === 'lastName') return t('auth.lastNameRequired')
        if (field === 'email') return t('auth.emailRequired')
        return t('auth.passwordRequired')

      case 'invalidEmail':
        return t('auth.invalidEmail')

      case 'minLength':
        return t('auth.passwordMinLength')

      case 'maxLength':
        return t('auth.registrationFieldTooLong')

      default:
        return t('auth.registrationFailed')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const normalizedFirstName = firstName.trim()
    const normalizedLastName = lastName.trim()
    const normalizedEmail = email.trim()

    const firstNameError = validate(normalizedFirstName, [
      required,
      maxLength(100),
    ])
    const lastNameError = validate(normalizedLastName, [
      required,
      maxLength(100),
    ])
    const emailError = validate(normalizedEmail, [
      required,
      emailValidator,
    ])
    const passwordError = validate(password, [
      required,
      minLength(8),
    ])

    const newFieldErrors = {
      firstName: firstNameError
        ? getValidationMessage(firstNameError, 'firstName')
        : '',
      lastName: lastNameError
        ? getValidationMessage(lastNameError, 'lastName')
        : '',
      email: emailError
        ? getValidationMessage(emailError, 'email')
        : '',
      password: passwordError
        ? getValidationMessage(passwordError, 'password')
        : '',
    }

    setFieldErrors(newFieldErrors)

    if (
      firstNameError ||
      lastNameError ||
      emailError ||
      passwordError
    ) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        password,
        role,
      })

      setRegistrationComplete(true)
    } catch {
      setError(t('auth.registrationFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="register-page">
        <h1>{t('auth.registrationComplete')}</h1>
        <p>{t('auth.registrationPendingApproval')}</p>
        <Link to="/login">{t('auth.backToLogin')}</Link>
      </div>
    )
  }

  return (
    <div className="register-page">
      <h1>{t('common.register')}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="firstName">{t('profile.firstName')}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.firstName)}
            aria-describedby={
              fieldErrors.firstName ? 'firstName-error' : undefined
            }
          />
          {fieldErrors.firstName && (
            <p id="firstName-error" role="alert">
              {fieldErrors.firstName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName">{t('profile.lastName')}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.lastName)}
            aria-describedby={
              fieldErrors.lastName ? 'lastName-error' : undefined
            }
          />
          {fieldErrors.lastName && (
            <p id="lastName-error" role="alert">
              {fieldErrors.lastName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email">{t('common.email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? 'email-error' : undefined
            }
          />
          {fieldErrors.email && (
            <p id="email-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'password-error' : undefined
            }
          />
          {fieldErrors.password && (
            <p id="password-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="role">{t('auth.accountType')}</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as RegistrationRole)
            }
          >
            <option value={USER_ROLES.CANDIDATE}>
              {t('common.candidate')}
            </option>
            <option value={USER_ROLES.RECRUITER}>
              {t('common.recruiter')}
            </option>
          </select>
        </div>

        {error && <p role="alert">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting
            ? t('auth.creatingAccount')
            : t('common.register')}
        </button>
      </form>
    </div>
  )
}

export default RegisterPage
