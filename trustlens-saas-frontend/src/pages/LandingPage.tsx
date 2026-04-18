import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'

function LandingPage() {
  const [remainingSeconds, setRemainingSeconds] = useState(120)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => (current <= 0 ? 120 : current - 1))
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds % 60).padStart(2, '0')
  const trustLensTime = 2
  const manualTime = 48 * 60
  const timeSavedPercent = Math.round(((manualTime - trustLensTime) / manualTime) * 100)

  return (
    <div className="page-shell ambient-bg">
      <TopNav />

      <main className="landing-main">
        <section className="hero-panel reveal">
          <p className="eyebrow">Agentic Underwriting SaaS</p>
          <h1>Build autonomous, compliant lending journeys in under 2 minutes.</h1>
          <p className="lead">
            TrustLens AI wraps your current stack with multilingual intent capture,
            BRE-compatible decisioning, explainability, and DPDP-grade consent control.
          </p>

          <div className="hero-ctas">
            <Link to="/signin" className="button primary">
              Start secure workspace
            </Link>
            <Link to="/architecture" className="button ghost">
              View architecture
            </Link>
          </div>
        </section>

        <section className="strip-grid" id="impact">
          <article className="strip-card reveal delay-1">
            <h3>60%</h3>
            <p>Faster loan approvals with conversational intake.</p>
          </article>
          <article className="strip-card reveal delay-2">
            <h3>35%</h3>
            <p>Lower drop-off through multilingual onboarding.</p>
          </article>
          <article className="strip-card reveal delay-3">
            <h3>50%</h3>
            <p>Reduced manual review with explainable narratives.</p>
          </article>
        </section>

        <section className="panel countdown-panel reveal" id="time-comparison">
          <div>
            <p className="eyebrow">Loan Processing Countdown</p>
            <h2>Decision in progress</h2>
            <p className="lead compact">
              Live simulation of TrustLens loan processing time versus traditional
              manual underwriting.
            </p>
            <p className="countdown-display" aria-live="polite">
              {minutes}:{seconds}
            </p>
            <p className="countdown-note">
              TrustLens AI completes the decision loop in around 2 minutes.
            </p>
          </div>

          <div className="time-compare-grid">
            <article className="time-card manual">
              <p className="time-label">Manual Process</p>
              <p className="time-value">48 hours</p>
              <p className="time-detail">Forms, verification queue, and repeated review.</p>
            </article>
            <article className="time-card saas">
              <p className="time-label">TrustLens SaaS</p>
              <p className="time-value">2 minutes</p>
              <p className="time-detail">
                Conversational intake, BRE sync, and explainable decision narrative.
              </p>
            </article>
          </div>

          <div className="time-saved-banner">
            <strong>{timeSavedPercent}%</strong> reduction in decision turnaround time.
          </div>
        </section>

        <section className="architecture" id="architecture">
          <h2>How the SaaS works</h2>
          <div className="flow-grid">
            <article className="flow-card reveal">
              <p className="flow-step">1</p>
              <h3>Capture</h3>
              <p>Web voice intake captures multilingual financial context.</p>
            </article>
            <article className="flow-card reveal delay-1">
              <p className="flow-step">2</p>
              <h3>Integrate</h3>
              <p>Structured payload syncs into 1LMS, vKYC, and BRE adapters.</p>
            </article>
            <article className="flow-card reveal delay-2">
              <p className="flow-step">3</p>
              <h3>Explain</h3>
              <p>AI creates transparent decision narratives in user language.</p>
            </article>
            <article className="flow-card reveal delay-3" id="security">
              <p className="flow-step">4</p>
              <h3>Secure</h3>
              <p>Consent signatures are hashed and persisted in audit vault logs.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
