import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'

function Layout() {
    const navigate = useNavigate()
    const { isAuthenticated, logout } = useAuth()

    function handleLogout() {
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <>
            <header>
                <nav>
                    <Link to="/">Home</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/profile">Profile</Link>

                            <button type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </header>

            <main>
                <Outlet />
            </main>
        </>
    )
}

export default Layout