import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'

function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isLoading } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

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

        try {
            const user = await login(normalizedEmail, password)

            if (user.status !== 'ACTIVE') {
                setError('Account is not active.')
                return
            }

            const from = location.state?.from?.pathname ?? '/dashboard'
            navigate(from, { replace: true })
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Login failed.',
            )
        }
    }

    return (
        <main>
            <h1>Login</h1>

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
                        autoComplete="current-password"
                    />
                </div>

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </main>
    )
}

export default LoginPage