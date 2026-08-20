import { Link, Outlet } from 'react-router-dom'

function Layout() {
    return (
        <>
            <header>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </nav>
            </header>

            <main>
                <Outlet />
            </main>
        </>
    )
}

export default Layout