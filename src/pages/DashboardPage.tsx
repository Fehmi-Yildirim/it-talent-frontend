import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import './DashboardPage.css'

function DashboardPage() {
  const { user } = useAuth()

  const isRecruiter = user?.role === 'RECRUITER'
  const isAdmin = user?.role === 'ADMIN'

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

      {isRecruiter && (
        <section
          className="dashboard-recruiter"
          aria-labelledby="recruiter-tools-heading"
        >
          <div className="dashboard-section-header">
            <div>
              <p className="dashboard-eyebrow">Recruiter</p>
              <h2 id="recruiter-tools-heading">Recruiter tools</h2>
            </div>
          </div>

          <p className="dashboard-recruiter-description">
            Manage your company's job vacancies and requirements.
          </p>

          <div className="dashboard-recruiter-actions">
            <Link
              to="/recruiter/jobs"
              className="dashboard-action dashboard-action--primary"
            >
              Manage jobs
            </Link>

            <Link
              to="/recruiter/jobs/new"
              className="dashboard-action dashboard-action--secondary"
            >
              New job
            </Link>
          </div>
        </section>
      )}

      {isAdmin && (
        <section
          className="dashboard-admin"
          aria-labelledby="admin-tools-heading"
        >
          <div className="dashboard-section-header">
            <div>
              <p className="dashboard-eyebrow">Administration</p>
              <h2 id="admin-tools-heading">Admin tools</h2>
            </div>
          </div>

          <p className="dashboard-admin-description">
            Manage users and platform administration.
          </p>

          <div className="dashboard-admin-actions">
            <Link
              to="/admin/users"
              className="dashboard-action dashboard-action--primary"
            >
              Manage users
            </Link>
          </div>
        </section>
      )}

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
