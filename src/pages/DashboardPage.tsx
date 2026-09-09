import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth'
import {
  getCandidateDashboard,
  getRecruiterDashboard,
} from '../features/dashboard/dashboard.api'
import { useTranslation } from '../i18n/context'
import type {
  CandidateDashboard,
  RecruiterDashboard,
} from '../types/dashboard'
import './DashboardPage.css'

function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()

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
      setError(t('dashboard.loadError'))
    } finally {
      setLoading(false)
    }
  }, [isAdmin, isCandidate, isRecruiter, t, user])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  if (loading) {
    return (
      <section className="dashboard-page" aria-busy="true">
        <div className="dashboard-state">
          <p>{t('dashboard.loading')}</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-state dashboard-state--error">
          <h1>{t('dashboard.unavailable')}</h1>
          <p>{error}</p>
          <button
            type="button"
            className="dashboard-action dashboard-action--primary"
            onClick={() => void loadDashboard()}
          >
            {t('dashboard.retry')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            {t('dashboard.eyebrow')}
          </p>

          <h1>{t('dashboard.title')}</h1>

          <p className="dashboard-welcome">
            {t('dashboard.welcomeBack')}
          </p>
        </div>

        <Link to="/profile" className="dashboard-profile-link">
          {t('dashboard.viewProfile')}
        </Link>
      </div>

      {isCandidate && candidateDashboard && (
        <section
          className="dashboard-content"
          aria-label={t('dashboard.candidate.dashboardLabel')}
        >
          <section className="dashboard-grid">
            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.candidate.profile')}
              </p>

              <h2>
                {candidateDashboard.profile.completionPercentage}%{' '}
                {t('dashboard.candidate.complete')}
              </h2>

              <p>
                {t('dashboard.candidate.status')}:{' '}
                {candidateDashboard.profile.status}
              </p>

              <Link
                to="/profile"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.candidate.editProfile')}
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.candidate.applications')}
              </p>

              <h2>{candidateDashboard.applications.total}</h2>

              <p>{t('dashboard.candidate.totalApplications')}</p>

              <Link
                to="/applications"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.candidate.viewApplications')}
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.candidate.availableJobs')}
              </p>

              <h2>{candidateDashboard.jobs.availableCount}</h2>

              <p>
                {candidateDashboard.jobs.recommendedCount}{' '}
                {t('dashboard.candidate.recommended')}
              </p>

              <Link
                to="/jobs"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.candidate.browseJobs')}
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.candidate.skills')}
              </p>

              <h2>{candidateDashboard.skills.total}</h2>

              <p>{t('dashboard.candidate.skillsInProfile')}</p>

              <Link
                to="/profile"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.candidate.manageProfile')}
              </Link>
            </article>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">
                  {t('dashboard.candidate.applicationOverview')}
                </p>

                <h2>
                  {t('dashboard.candidate.applicationsByStatus')}
                </h2>
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
                <p className="dashboard-eyebrow">
                  {t('dashboard.candidate.recentApplications')}
                </p>

                <h2>
                  {t('dashboard.candidate.latestApplications')}
                </h2>
              </div>

              <Link to="/applications">
                {t('dashboard.candidate.viewAll')}
              </Link>
            </div>

            {candidateDashboard.applications.recent.length === 0 ? (
              <p className="dashboard-empty">
                {t('dashboard.candidate.noApplications')}
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
                <p className="dashboard-eyebrow">
                  {t('dashboard.candidate.recentJobs')}
                </p>

                <h2>
                  {t('dashboard.candidate.latestOpportunities')}
                </h2>
              </div>

              <Link to="/jobs">
                {t('dashboard.candidate.browseAll')}
              </Link>
            </div>

            {candidateDashboard.jobs.recent.length === 0 ? (
              <p className="dashboard-empty">
                {t('dashboard.candidate.noJobs')}
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
        <section
          className="dashboard-content"
          aria-label={t('dashboard.recruiter.dashboardLabel')}
        >
          <section className="dashboard-grid">
            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.recruiter.company')}
              </p>

              <h2>
                {recruiterDashboard.profile.company?.name ??
                  t('dashboard.recruiter.noCompany')}
              </h2>

              <p>
                {t('dashboard.recruiter.status')}:{' '}
                {recruiterDashboard.profile.status}
              </p>

              <Link
                to="/recruiter/company"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.recruiter.manageCompany')}
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.recruiter.jobs')}
              </p>

              <h2>{recruiterDashboard.jobs.total}</h2>

              <p>
                {recruiterDashboard.jobs.published}{' '}
                {t('dashboard.recruiter.published')} ·{' '}
                {recruiterDashboard.jobs.draft}{' '}
                {t('dashboard.recruiter.draft')} ·{' '}
                {recruiterDashboard.jobs.closed}{' '}
                {t('dashboard.recruiter.closed')}
              </p>

              <Link
                to="/recruiter/jobs"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.recruiter.manageJobs')}
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.recruiter.applications')}
              </p>

              <h2>{recruiterDashboard.applications.total}</h2>

              <p>{t('dashboard.recruiter.totalApplications')}</p>

              <Link
                to="/recruiter/applications"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.recruiter.viewApplications')}
              </Link>
            </article>

            <article className="dashboard-card">
              <p className="dashboard-eyebrow">
                {t('dashboard.recruiter.recruiter')}
              </p>

              <h2>
                {recruiterDashboard.profile.jobTitle ??
                  t('dashboard.recruiter.recruiter')}
              </h2>

              <Link
                to="/recruiter/profile"
                className="dashboard-action dashboard-action--secondary"
              >
                {t('dashboard.recruiter.editProfile')}
              </Link>
            </article>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">
                  {t('dashboard.recruiter.applicationOverview')}
                </p>

                <h2>
                  {t('dashboard.recruiter.applicationsByStatus')}
                </h2>
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
                <p className="dashboard-eyebrow">
                  {t('dashboard.recruiter.recentApplications')}
                </p>

                <h2>
                  {t('dashboard.recruiter.latestCandidates')}
                </h2>
              </div>

              <Link to="/recruiter/applications">
                {t('dashboard.recruiter.viewAll')}
              </Link>
            </div>

            {recruiterDashboard.applications.recent.length === 0 ? (
              <p className="dashboard-empty">
                {t('dashboard.recruiter.noApplications')}
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
                        {application.candidate.headline ??
                          t('dashboard.recruiter.candidate')}
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
                <p className="dashboard-eyebrow">
                  {t('dashboard.recruiter.recentJobs')}
                </p>

                <h2>
                  {t('dashboard.recruiter.latestVacancies')}
                </h2>
              </div>

              <Link to="/recruiter/jobs">
                {t('dashboard.recruiter.viewAll')}
              </Link>
            </div>

            {recruiterDashboard.jobs.recent.length === 0 ? (
              <p className="dashboard-empty">
                {t('dashboard.recruiter.noJobs')}
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
              <p className="dashboard-eyebrow">
                {t('dashboard.admin.administration')}
              </p>

              <h2 id="admin-tools-heading">
                {t('dashboard.admin.tools')}
              </h2>
            </div>
          </div>

          <p className="dashboard-admin-description">
            {t('dashboard.admin.description')}
          </p>

          <div className="dashboard-admin-actions">
            <Link
              to="/admin/users"
              className="dashboard-action dashboard-action--primary"
            >
              {t('dashboard.admin.manageUsers')}
            </Link>
          </div>
        </section>
      )}

      <section
        className="dashboard-account"
        aria-labelledby="account-heading"
      >
        <div className="dashboard-section-header">
          <div>
            <p className="dashboard-eyebrow">
              {t('dashboard.account.account')}
            </p>

            <h2 id="account-heading">
              {t('dashboard.account.yourAccount')}
            </h2>
          </div>
        </div>

        {user && (
          <dl className="dashboard-account-details">
            <div className="dashboard-account-item">
              <dt>{t('dashboard.account.email')}</dt>
              <dd>{user.email}</dd>
            </div>

            <div className="dashboard-account-item">
              <dt>{t('dashboard.account.role')}</dt>
              <dd>{user.role}</dd>
            </div>

            <div className="dashboard-account-item">
              <dt>{t('dashboard.account.status')}</dt>
              <dd>{user.status}</dd>
            </div>
          </dl>
        )}
      </section>
    </section>
  )
}

export default DashboardPage