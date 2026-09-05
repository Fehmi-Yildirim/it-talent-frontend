import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function CandidateRoute() {
    const location = useLocation()
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (user?.role !== 'CANDIDATE') {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default CandidateRoute