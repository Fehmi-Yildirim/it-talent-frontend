import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useTranslation } from '../i18n/context'

function LoginPage() {
  const { login, isLoading } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError(t('auth.emailRequired'))
      return
    }

    if (!normalizedEmail.includes('@')) {
      setError(t('auth.invalidEmail'))
      return
    }

    if (password.length < 8) {
      setError(t('auth.passwordMinLength'))
      return
    }

    try {
      const user = await login(normalizedEmail, password)

      if (user.status !== 'ACTIVE') {
        setError(t('auth.accountNotActive'))
        return
      }

      if (user.role === 'CANDIDATE') {
        navigate('/jobs')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t('auth.loginFailed'),
      )
    }
  }

  return (
    <section>
      <h1>{t('auth.login')}</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        <div>
          <label htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        {error && (
          <p id="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>
    </section>
  )
}

export default LoginPage
