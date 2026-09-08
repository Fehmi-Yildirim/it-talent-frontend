import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import './LandingPage.css'

function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-eyebrow">IT Talent Platform</span>

          <h1>IT Talent</h1>

          <h2>Connect talent with the right IT opportunities.</h2>

          <p className="landing-hero-description">
            IT Talent helps candidates and recruiters connect through a focused
            platform for the IT job market.
          </p>

          <div className="landing-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-primary-button">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing-primary-button">
                  Get started
                </Link>

                <Link to="/login" className="landing-secondary-button">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="landing-audience">
        <article className="landing-card">
          <span className="landing-card-label">For candidates</span>

          <h2>Build your IT career</h2>

          <p>
            Create your profile and present your skills and experience to
            potential employers.
          </p>

          {!isAuthenticated && (
            <Link to="/register">Create your account →</Link>
          )}
        </article>

        <article className="landing-card">
          <span className="landing-card-label">For recruiters</span>

          <h2>Find IT talent</h2>

          <p>
            Build your recruiter profile and connect with professionals for
            your hiring needs.
          </p>

          {!isAuthenticated && (
            <Link to="/register">Get started →</Link>
          )}
        </article>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} IT Talent</span>
      </footer>
    </div>
  )
}

export default LandingPage
