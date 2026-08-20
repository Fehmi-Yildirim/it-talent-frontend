import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAccessToken } from '../features/auth/auth.storage'

function ProtectedRoute() {
    const location = useLocation()
    const accessToken = getAccessToken()

    if (!accessToken) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute