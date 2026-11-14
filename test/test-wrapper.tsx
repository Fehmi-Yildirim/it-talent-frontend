import type { ReactNode } from 'react'
import { I18nProvider } from '../src/i18n/context'
import { AuthProvider } from '../src/features/auth/AuthProvider'

export function Wrapper({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
    )
}
