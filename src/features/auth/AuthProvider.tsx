import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react'
import { getAccessToken, clearAccessToken } from './auth.storage'
import type { AuthUser } from './auth.types'

interface AuthContextValue {
    user: AuthUser | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(
        getAccessToken(),
    )

    const logout = () => {
        clearAccessToken()
        setAccessToken(null)
    }

    const value: AuthContextValue = {
        user: null,
        accessToken,
        isAuthenticated: Boolean(accessToken),
        isLoading: false,
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