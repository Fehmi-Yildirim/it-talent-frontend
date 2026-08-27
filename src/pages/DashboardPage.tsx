import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import './DashboardPage.css'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">IT Talent Dashboard</p>
          <h1>Dashboard</h1>
          <p className="dashboard-welcome">Welcome back</p>
        </div>

        <Link to="/profile" className="dashboard-profile-link">
          View profile
        </Link>
      </div>

      <section className="dashboard-account" aria-labelledby="account-heading">
        <div className="dashboard-section-header">
          <div>
            <p className="dashboard-eyebrow">Account</p>
            <h2 id="account-heading">Your account</h2>
          </div>
        </div>

        {user && (
          <dl className="dashboard-account-details">
            <div className="dashboard-account-item">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>

            <div className="dashboard-account-item">
              <dt>Role</dt>
              <dd>{user.role}</dd>
            </div>

            <div className="dashboard-account-item">
              <dt>Status</dt>
              <dd>{user.status}</dd>
            </div>
          </dl>
        )}
      </section>
    </section>
  )
}

export default DashboardPage
