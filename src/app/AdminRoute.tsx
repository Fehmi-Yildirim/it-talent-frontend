import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function AdminRoute() {
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default AdminRoute
