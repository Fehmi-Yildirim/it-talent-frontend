import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth'
import {
  getCandidateDashboard,
  getRecruiterDashboard,
} from '../features/dashboard/dashboard.api'
import type {
  CandidateDashboard,
  RecruiterDashboard,
} from '../types/dashboard'
import './DashboardPage.css'

function DashboardPage() {
  const { user } = useAuth()

  const [candidateDashboard, setCandidateDashboard] =
    useState<CandidateDashboard | null>(null)
  const [recruiterDashboard, setRecruiterDashboard] =
    useState<RecruiterDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isCandidate = user?.role === 'CANDIDATE'
  const isRecruiter = user?.role === 'RECRUITER'
  const isAdmin = user?.role === 'ADMIN'

  const loadDashboard = useCallback(async () => {
    if (!user || isAdmin) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isCandidate) {
        setCandidateDashboard(await getCandidateDashboard())
      } else if (isRecruiter) {
        setRecruiterDashboard(await getRecruiterDashboard())
      }
    } catch {
      setError('Unable to load the dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, isCandidate, isRecruiter, user])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  if (loading) {
    return (
      <section className="dashboard-page" aria-busy="true">
        <div className="dashboard-state">
          <p>Loading dashboard...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-state dashboard-state--error">
          <h1>Dashboard unavailable</h1>
          <p>{error}</p>
          <button
            type="button"
            className="dashboard-action dashboard-action--primary"
            onClick={() => void loadDashboard()}
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

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

      {isCandidate && candidateDashboard && (
        <section className="dashboard-content" aria-label="Candidate dashboard">
          <section className="dashboard-grid">
            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Profile</p>
              <h2>{candidateDashboard.profile.completionPercentage}% complete</h2>
              <p>Status: {candidateDashboard.profile.status}</p>
              <Link
                to="/profile"
                className="dashboard-action dashboard-action--secondary"
              >
                Edit profile
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Applications</p>
              <h2>{candidateDashboard.applications.total}</h2>
              <p>Total applications</p>
              <Link
                to="/applications"
                className="dashboard-action dashboard-action--secondary"
              >
                View applications
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Available jobs</p>
              <h2>{candidateDashboard.jobs.availableCount}</h2>
              <p>{candidateDashboard.jobs.recommendedCount} recommended</p>
              <Link
                to="/jobs"
                className="dashboard-action dashboard-action--secondary"
              >
                Browse jobs
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Skills</p>
              <h2>{candidateDashboard.skills.total}</h2>
              <p>Skills in your profile</p>
              <Link
                to="/profile"
                className="dashboard-action dashboard-action--secondary"
              >
                Manage profile
              </Link>
            </article>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">Application overview</p>
                <h2>Applications by status</h2>
              </div>
            </div>

            <div className="dashboard-stat-list">
              {Object.entries(candidateDashboard.applications.byStatus).map(
                ([status, count]) => (
                  <div key={status} className="dashboard-stat-item">
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">Recent applications</p>
                <h2>Your latest applications</h2>
              </div>

              <Link to="/applications">View all</Link>
            </div>

            {candidateDashboard.applications.recent.length === 0 ? (
              <p className="dashboard-empty">
                You have not submitted any applications yet.
              </p>
            ) : (
              <div className="dashboard-list">
                {candidateDashboard.applications.recent.map((application) => (
                  <Link
                    key={application.id}
                    to={`/applications/${application.id}`}
                    className="dashboard-list-item"
                  >
                    <div>
                      <strong>{application.job.title}</strong>
                      <span>{application.job.company.name}</span>
                    </div>
                    <span>{application.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">Recent jobs</p>
                <h2>Latest opportunities</h2>
              </div>

              <Link to="/jobs">Browse all</Link>
            </div>

            {candidateDashboard.jobs.recent.length === 0 ? (
              <p className="dashboard-empty">
                No published jobs are currently available.
              </p>
            ) : (
              <div className="dashboard-list">
                {candidateDashboard.jobs.recent.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="dashboard-list-item"
                  >
                    <div>
                      <strong>{job.title}</strong>
                      <span>{job.company.name}</span>
                    </div>
                    <span>{job.workMode}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      {isRecruiter && recruiterDashboard && (
        <section className="dashboard-content" aria-label="Recruiter dashboard">
          <section className="dashboard-grid">
            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Company</p>
              <h2>
                {recruiterDashboard.profile.company?.name ?? 'No company'}
              </h2>
              <p>Status: {recruiterDashboard.profile.status}</p>
              <Link
                to="/recruiter/company"
                className="dashboard-action dashboard-action--secondary"
              >
                Manage company
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Jobs</p>
              <h2>{recruiterDashboard.jobs.total}</h2>
              <p>
                {recruiterDashboard.jobs.published} published ·{' '}
                {recruiterDashboard.jobs.draft} draft ·{' '}
                {recruiterDashboard.jobs.closed} closed
              </p>
              <Link
                to="/recruiter/jobs"
                className="dashboard-action dashboard-action--secondary"
              >
                Manage jobs
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Applications</p>
              <h2>{recruiterDashboard.applications.total}</h2>
              <p>Total applications</p>
              <Link
                to="/recruiter/applications"
                className="dashboard-action dashboard-action--secondary"
              >
                View applications
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">Recruiter</p>
              <h2>{recruiterDashboard.profile.jobTitle ?? 'Recruiter'}</h2>
              <Link
                to="/recruiter/profile"
                className="dashboard-action dashboard-action--secondary"
              >
                Edit profile
              </Link>
            </article>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">Application overview</p>
                <h2>Applications by status</h2>
              </div>
            </div>

            <div className="dashboard-stat-list">
              {Object.entries(recruiterDashboard.applications.byStatus).map(
                ([status, count]) => (
                  <div key={status} className="dashboard-stat-item">
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">Recent applications</p>
                <h2>Latest candidates</h2>
              </div>

              <Link to="/recruiter/applications">View all</Link>
            </div>

            {recruiterDashboard.applications.recent.length === 0 ? (
              <p className="dashboard-empty">
                No applications have been received yet.
              </p>
            ) : (
              <div className="dashboard-list">
                {recruiterDashboard.applications.recent.map((application) => (
                  <Link
                    key={application.id}
                    to={`/recruiter/applications/${application.id}`}
                    className="dashboard-list-item"
                  >
                    <div>
                      <strong>
                        {application.candidate.headline ?? 'Candidate'}
                      </strong>
                      <span>{application.job.title}</span>
                    </div>
                    <span>{application.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">Recent jobs</p>
                <h2>Latest vacancies</h2>
              </div>

              <Link to="/recruiter/jobs">View all</Link>
            </div>

            {recruiterDashboard.jobs.recent.length === 0 ? (
              <p className="dashboard-empty">
                No jobs have been created yet.
              </p>
            ) : (
              <div className="dashboard-list">
                {recruiterDashboard.jobs.recent.map((job) => (
                  <Link
                    key={job.id}
                    to={`/recruiter/jobs/${job.id}`}
                    className="dashboard-list-item"
                  >
                    <div>
                      <strong>{job.title}</strong>
                      <span>{job.status}</span>
                    </div>
                    <span>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
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
