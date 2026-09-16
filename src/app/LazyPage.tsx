import type { ReactNode } from 'react'
import { Suspense } from 'react'

function LazyPage({ children }: { children: ReactNode }) {
    return <Suspense fallback={null}>{children}</Suspense>
}

export default LazyPage
