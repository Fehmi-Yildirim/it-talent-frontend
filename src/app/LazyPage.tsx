import type { ReactNode } from 'react'
import { Suspense } from 'react'

import LoadingState from '../components/feedback/LoadingState'

function LazyPage({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<LoadingState message="Loading..." />}>
            {children}
        </Suspense>
    )
}

export default LazyPage