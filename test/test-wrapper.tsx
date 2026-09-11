import type { ReactNode } from 'react'
import { I18nProvider } from '../src/i18n/context'

export function Wrapper({ children }: { children: ReactNode }) {
    return <I18nProvider>{children}</I18nProvider>
}