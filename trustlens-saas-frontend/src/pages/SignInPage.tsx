import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { backendClient } from '../services/backendClient'
import { setSession } from '../security/auth'

function SignInPage() {
  const navigate = useNavigate()
  const [workEmail, setWorkEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const response = await backendClient.signIn({ workEmail, password })
    setLoading(false)

    if (!response.ok) {
      setError(response.error)
      return
    }

    setSession(response.data.token, {
      role: response.data.role,
      displayName: response.data.displayName,
    })
    navigate('/dashboard')
  }

  return (
    <div className="page-shell grid-bg">
      <TopNav />

      <main className="auth-main">
        <section className="auth-card reveal">
          <p className="eyebrow">Secure Operator Access</p>
          <h1>Sign in to TrustLens Control Panel</h1>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={workEmail}
              onChange={(event) => setWorkEmail(event.target.value)}
              placeholder="admin@trustlens.demo"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin@123"
              required
            />

            {error && <p className="error-banner">{error}</p>}

            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Sign in securely'}
            </button>
          </form>

          <p className="auth-note">
            Demo users: admin@trustlens.demo / Admin@123, underwriter@trustlens.demo /
            Underwriter@123, auditor@trustlens.demo / Auditor@123.
          </p>
          <div className="demo-fill-row">
            <button
              type="button"
              className="button ghost"
              onClick={() => {
                setWorkEmail('admin@trustlens.demo')
                setPassword('Admin@123')
              }}
            >
              Fill Admin Demo
            </button>
            <button
              type="button"
              className="button ghost"
              onClick={() => {
                setWorkEmail('underwriter@trustlens.demo')
                setPassword('Underwriter@123')
              }}
            >
              Fill Underwriter Demo
            </button>
          </div>
          <Link to="/" className="inline-link">
            Return to product overview
          </Link>
        </section>
      </main>
    </div>
  )
}

export default SignInPage
