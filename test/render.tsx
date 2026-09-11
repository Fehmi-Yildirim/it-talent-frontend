import type { ReactElement } from 'react'
import { render as rtlRender } from '@testing-library/react'
import { Wrapper } from './test-wrapper'

export function render(ui: ReactElement) {
    return rtlRender(ui, {
        wrapper: Wrapper,
    })
}