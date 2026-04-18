import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import KpiChart from '../components/KpiChart'
import MetricCard from '../components/MetricCard'
import TopNav from '../components/TopNav'
import { backendClient } from '../services/backendClient'
import type {
  DecisionResponse,
  FeatureFlags,
  KpiPoint,
  RoleWorkspaceWidget,
  SimulationInput,
} from '../services/backendClient'
import {
  clearSession,
  getSessionTimeoutMs,
  getSessionProfile,
  isSessionExpired,
  touchSession,
} from '../security/auth'
import { sanitizeNarrative } from '../security/sanitize'

type ScenarioKey = 'strong' | 'borderline' | 'consentMissing' | 'custom'

const DEMO_SCENARIOS: Record<Exclude<ScenarioKey, 'custom'>, SimulationInput> = {
  strong: {
    language: 'Marathi',
    monthlyIncome: 70000,
    statedPurpose: 'Working capital for expansion and inventory cycle support',
    consentAccepted: true,
  },
  borderline: {
    language: 'Hindi',
    monthlyIncome: 32000,
    statedPurpose: 'Short-term liquidity for supplier payouts',
    consentAccepted: true,
  },
  consentMissing: {
    language: 'English',
    monthlyIncome: 52000,
    statedPurpose: 'Business equipment upgrade for production capacity',
    consentAccepted: false,
  },
}

function DashboardPage() {
  const navigate = useNavigate()
  const profile = getSessionProfile()

  const [language, setLanguage] = useState<SimulationInput['language']>('Marathi')
  const [monthlyIncome, setMonthlyIncome] = useState(50000)
  const [statedPurpose, setStatedPurpose] = useState('Working capital for retail expansion')
  const [consentAccepted, setConsentAccepted] = useState(true)
  const [error, setError] = useState('')
  const [decision, setDecision] = useState<DecisionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [kpiPoints, setKpiPoints] = useState<KpiPoint[]>([])
  const [roleWidgets, setRoleWidgets] = useState<RoleWorkspaceWidget[]>([])
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('custom')

  const featureFlags: FeatureFlags = profile
    ? backendClient.getFeatureFlags(profile.role)
    : {
        canRunSimulation: false,
        canViewAudit: false,
        canViewKpis: false,
        canManageUsers: false,
      }

  const latestPoint = kpiPoints[kpiPoints.length - 1]

  useEffect(() => {
    if (!profile) {
      navigate('/signin')
      return
    }

    const interactions = ['mousemove', 'keydown', 'click', 'touchstart'] as const

    const renewSession = () => touchSession()

    interactions.forEach((eventName) => {
      window.addEventListener(eventName, renewSession)
    })

    const timer = window.setInterval(() => {
      if (isSessionExpired()) {
        clearSession()
        navigate('/signin')
      }
    }, 30_000)

    let unsubscribe: () => void = () => {}
    backendClient.getKpiSnapshot().then((snapshot) => setKpiPoints(snapshot))
    backendClient
      .getRoleWidgets(profile.role)
      .then((widgets) => setRoleWidgets(widgets))
    unsubscribe = backendClient.subscribeToKpiStream((point) => {
      setKpiPoints((current) => [...current.slice(-11), point])
    })

    return () => {
      interactions.forEach((eventName) => {
        window.removeEventListener(eventName, renewSession)
      })
      window.clearInterval(timer)
      unsubscribe()
    }
  }, [navigate, profile])

  async function runSimulation(overrides?: Partial<SimulationInput>) {
    const payload: SimulationInput = {
      language: overrides?.language ?? language,
      monthlyIncome: overrides?.monthlyIncome ?? monthlyIncome,
      consentAccepted: overrides?.consentAccepted ?? consentAccepted,
      statedPurpose: overrides?.statedPurpose ?? statedPurpose,
    }

    setLoading(true)
    setError('')

    const response = await backendClient.runDecisionSimulation(payload)

    setLoading(false)
    touchSession()

    if (!response.ok) {
      setError(response.error)
      setDecision(null)
      return
    }

    setDecision(response.data)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActiveScenario('custom')
    await runSimulation()
  }

  async function handleScenarioSelect(scenario: Exclude<ScenarioKey, 'custom'>) {
    const preset = DEMO_SCENARIOS[scenario]
    setLanguage(preset.language)
    setMonthlyIncome(preset.monthlyIncome)
    setStatedPurpose(preset.statedPurpose)
    setConsentAccepted(preset.consentAccepted)
    setActiveScenario(scenario)
    await runSimulation(preset)
  }

  return (
    <div className="page-shell dashboard-bg">
      <TopNav onSignOut={() => navigate('/signin')} />

      <main className="dashboard-main">
        <section className="panel reveal">
          <p className="eyebrow">Operations Snapshot</p>
          <h1>TrustLens Control Center</h1>
          <p className="lead compact">
            Signed in as {profile?.displayName ?? 'Operator'} ({profile?.role ?? 'Unknown'}).{' '}
            Session auto-lock is active after {Math.floor(getSessionTimeoutMs() / 60000)}
            minutes of inactivity.
          </p>

          <div className="metric-grid">
            <MetricCard
              value={latestPoint ? `0${Math.floor(latestPoint.ttdSeconds / 60)}:${String(latestPoint.ttdSeconds % 60).padStart(2, '0')}` : '01:42'}
              label="Median time-to-decision"
              trend="from Lentra stream"
            />
            <MetricCard
              value={`${latestPoint?.dropOffReduction ?? 35}%`}
              label="Drop-off reduction"
              trend="vs baseline"
            />
            <MetricCard
              value={`${latestPoint?.reviewReduction ?? 50}%`}
              label="Manual review saved"
              trend="underwriter efficiency"
            />
            <MetricCard
              value={`${latestPoint?.transparencyScore ?? 90}%`}
              label="Transparency score"
              trend="DPDP trace-ready"
            />
          </div>

          <div className="role-widget-grid">
            {roleWidgets.map((widget) => (
              <article key={widget.id} className="role-widget-card">
                <p className="widget-title">{widget.title}</p>
                <p className="widget-value">{widget.value}</p>
                <p className="widget-status">{widget.status}</p>
              </article>
            ))}
          </div>

          {featureFlags.canViewKpis ? <KpiChart points={kpiPoints} /> : null}
        </section>

        <section className="workspace-grid">
          <article className="panel reveal delay-1">
            <h2>Decision Simulator</h2>
            {featureFlags.canRunSimulation ? (
              <form className="decision-form" onSubmit={handleSubmit}>
              <div className="scenario-switcher">
                <p className="reason-subtitle">One-click demo scenarios</p>
                <div className="scenario-grid">
                  <button
                    type="button"
                    className={`button ghost scenario-btn ${activeScenario === 'strong' ? 'scenario-btn-active' : ''}`}
                    onClick={() => handleScenarioSelect('strong')}
                    disabled={loading}
                  >
                    Strong Approval
                  </button>
                  <button
                    type="button"
                    className={`button ghost scenario-btn ${activeScenario === 'borderline' ? 'scenario-btn-active' : ''}`}
                    onClick={() => handleScenarioSelect('borderline')}
                    disabled={loading}
                  >
                    Borderline
                  </button>
                  <button
                    type="button"
                    className={`button ghost scenario-btn ${activeScenario === 'consentMissing' ? 'scenario-btn-active' : ''}`}
                    onClick={() => handleScenarioSelect('consentMissing')}
                    disabled={loading}
                  >
                    Consent Missing
                  </button>
                </div>
                <p className="scenario-meta">
                  Each preset auto-fills fields and runs the flow instantly.
                </p>
              </div>

              <label htmlFor="language">Conversation language</label>
              <select
                id="language"
                value={language}
                onChange={(event) => {
                  setActiveScenario('custom')
                  setLanguage(event.target.value as SimulationInput['language'])
                }}
              >
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="English">English</option>
              </select>

              <label htmlFor="income">Monthly income</label>
              <input
                id="income"
                type="number"
                min={10000}
                step={1000}
                value={monthlyIncome}
                onChange={(event) => {
                  setActiveScenario('custom')
                  setMonthlyIncome(Number(event.target.value))
                }}
              />

              <label htmlFor="purpose">Loan purpose</label>
              <textarea
                id="purpose"
                value={statedPurpose}
                onChange={(event) => {
                  setActiveScenario('custom')
                  setStatedPurpose(event.target.value)
                }}
                rows={3}
              />

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(event) => {
                    setActiveScenario('custom')
                    setConsentAccepted(event.target.checked)
                  }}
                />
                I capture explicit DPDP consent from the applicant.
              </label>

              {error && <p className="error-banner">{error}</p>}

              <button className="button primary" type="submit" disabled={loading}>
                {loading ? 'Running simulation...' : 'Run secure decision flow'}
              </button>
              </form>
            ) : (
              <p className="empty-state">
                Your role has read-only mode. Ask Admin or Underwriter role to run
                simulation workflows.
              </p>
            )}

            {featureFlags.canManageUsers ? (
              <p className="auth-note">
                Admin feature flag active: role and policy management panels can be
                mounted here.
              </p>
            ) : null}
          </article>

          <article className="panel reveal delay-2">
            <h2>Explainability Output</h2>
            {decision ? (
              <>
                <p className="status-chip">
                  {decision.approved ? 'Approved' : 'Path to approval'} | Confidence{' '}
                  {decision.confidence}%
                </p>
                <p className="recommendation">{decision.recommendation}</p>
                <div
                  className="narrative"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeNarrative(decision.narrative),
                  }}
                />

                <section className="reason-group">
                  <h3>Decision reason codes</h3>
                  <div className="reason-grid">
                    {decision.reasons.map((reason) => (
                      <article
                        key={reason.code}
                        className={`reason-card reason-${reason.impact}`}
                      >
                        <p className="reason-code">{reason.code}</p>
                        <p className="reason-title">{reason.title}</p>
                        <p>{reason.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="reason-group">
                  <h3>Path to approval</h3>
                  {decision.blockers.length > 0 ? (
                    <>
                      <p className="reason-subtitle">Current blockers</p>
                      <ul className="audit-list">
                        {decision.blockers.map((blocker) => (
                          <li key={blocker}>{blocker}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="reason-subtitle">No blockers detected for this case.</p>
                  )}

                  <p className="reason-subtitle">Recommended next actions</p>
                  <ul className="audit-list">
                    {decision.nextActions.map((nextAction) => (
                      <li key={nextAction}>{nextAction}</li>
                    ))}
                  </ul>
                </section>

                {featureFlags.canViewAudit ? (
                  <ul className="audit-list">
                    <li>Trace ID: {crypto.randomUUID().slice(0, 8)}</li>
                    <li>Consent Hash: sha256:9f3c...af1d</li>
                    <li>{'Adapter path: 1LMS -> vKYC -> BRE -> XAI'}</li>
                  </ul>
                ) : null}
              </>
            ) : (
              <p className="empty-state">
                Trigger the simulator to generate multilingual explanation and audit
                artifacts.
              </p>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
