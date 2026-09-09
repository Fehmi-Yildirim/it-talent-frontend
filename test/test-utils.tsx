import type { ReactElement, ReactNode } from 'react'
import { render as rtlRender } from '@testing-library/react'
import { I18nProvider } from '../src/i18n/context'

function Wrapper({ children }: { children: ReactNode }) {
    return <I18nProvider>{children}</I18nProvider>
}

function render(ui: ReactElement) {
    return rtlRender(ui, {
        wrapper: Wrapper,
    })
}

export * from '@testing-library/react'
export { render }
