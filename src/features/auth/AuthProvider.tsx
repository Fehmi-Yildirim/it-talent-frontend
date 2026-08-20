import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react'
import { login } from './auth.api'
import { getAccessToken, setAccessToken, clearAccessToken } from './auth.storage'
import type { AuthUser } from './auth.types'

interface AuthContextValue {
    user: AuthUser | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<AuthUser>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setToken] = useState<string | null>(
        getAccessToken(),
    )
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (
        email: string,
        password: string,
    ): Promise<AuthUser> => {
        setIsLoading(true)

        try {
            const response = await login({
                email,
                password,
            })

            setAccessToken(response.accessToken)
            setToken(response.accessToken)
            setUser(response.user)

            return response.user
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        clearAccessToken()
        setToken(null)
        setUser(null)
    }

    const value: AuthContextValue = {
        user,
        accessToken,
        isAuthenticated: Boolean(accessToken),
        isLoading,
        login: handleLogin,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}