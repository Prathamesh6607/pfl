import { Link } from 'react-router-dom'
import { clearSession, getSessionToken } from '../security/auth'

type TopNavProps = {
  onSignOut?: () => void
}

function TopNav({ onSignOut }: TopNavProps) {
  const signedIn = Boolean(getSessionToken())

  return (
    <header className="top-nav">
      <Link to="/" className="brand">
        <span className="brand-mark">TL</span>
        <div>
          <p className="brand-name">TrustLens AI</p>
          <p className="brand-subtitle">Conversational Lending OS</p>
        </div>
      </Link>

      <nav className="nav-links">
        <Link to="/architecture">Architecture</Link>
        <Link to="/saas-strategy">SaaS Vision</Link>
        <Link to="/">Impact</Link>
        <Link to="/dashboard">Workspace</Link>
      </nav>

      {signedIn ? (
        <button
          className="button secondary"
          onClick={() => {
            clearSession()
            onSignOut?.()
          }}
        >
          Sign out
        </button>
      ) : (
        <Link to="/signin" className="button secondary">
          Sign in
        </Link>
      )}
    </header>
  )
}

export default TopNav
