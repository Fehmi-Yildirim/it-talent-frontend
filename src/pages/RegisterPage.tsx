import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../features/auth/auth.api'

function RegisterPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Email is required.')
      return
    }

    if (!normalizedEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await register({
        email: normalizedEmail,
        password,
        role,
      })

      if (response.user.status === 'PENDING') {
        navigate('/login', {
          state: {
            registrationPending: true,
          },
        })
        return
      }

      navigate('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-describedby={error ? 'register-error' : undefined}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            aria-describedby={error ? 'register-error' : undefined}
          />
        </div>

        <div>
          <label htmlFor="role">Account type</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as 'CANDIDATE' | 'RECRUITER')
            }
          >
            <option value="CANDIDATE">Candidate</option>
            <option value="RECRUITER">Recruiter</option>
          </select>
        </div>

        {error && (
          <p id="register-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </main>
  )
}

export default RegisterPage
