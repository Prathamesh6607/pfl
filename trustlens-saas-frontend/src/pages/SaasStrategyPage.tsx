import TopNav from '../components/TopNav'

function SaasStrategyPage() {
  return (
    <div className="page-shell ambient-bg">
      <TopNav />

      <main className="landing-main">
        <section className="panel reveal">
          <p className="eyebrow">SaaS Strategy</p>
          <h1>How TrustLens AI processes loans efficiently</h1>
          <p className="lead">
            TrustLens AI reduces turnaround time by converting unstructured voice,
            compliance intent, and policy constraints into one orchestrated decision loop.
          </p>

          <div className="ai-process-grid">
            <article className="process-card">
              <h3>1. Capture and structure</h3>
              <p>
                WebRTC intake captures multilingual context. AI extracts financial intent,
                income, and consent boundaries.
              </p>
            </article>
            <article className="process-card">
              <h3>2. Validate and decide</h3>
              <p>
                Data flows into 1LMS, vKYC, and BRE for policy-safe scoring and
                deterministic rule checks.
              </p>
            </article>
            <article className="process-card">
              <h3>3. Explain and audit</h3>
              <p>
                The system generates local-language reasoning, reason codes, and immutable
                consent traces for compliance teams.
              </p>
            </article>
          </div>
        </section>

        <section className="panel reveal delay-1">
          <h2>Future expansion roadmap</h2>
          <div className="expansion-grid">
            <article className="expansion-card">
              <p className="roadmap-stage">Phase 1</p>
              <h3>Product depth</h3>
              <p>
                Add collections intelligence, cross-sell decisioning, and product-specific
                risk templates.
              </p>
            </article>
            <article className="expansion-card">
              <p className="roadmap-stage">Phase 2</p>
              <h3>Market reach</h3>
              <p>
                Expand to 10+ Indian languages, rural speech models, and assisted-agent
                onboarding kits.
              </p>
            </article>
            <article className="expansion-card">
              <p className="roadmap-stage">Phase 3</p>
              <h3>Enterprise scale</h3>
              <p>
                Add on-prem deployment, federated model tuning, and regulator-facing audit
                APIs.
              </p>
            </article>
          </div>
        </section>

        <section className="pros-cons-grid">
          <article className="panel reveal delay-2">
            <h2>Our advantages</h2>
            <ul className="audit-list">
              <li>Integrates with existing Lentra stack without rip-and-replace.</li>
              <li>Explainable by default with reason codes and path-to-approval guidance.</li>
              <li>Regional language onboarding improves conversion and inclusion.</li>
              <li>DPDP-ready consent and audit telemetry reduce regulatory exposure.</li>
            </ul>
          </article>

          <article className="panel reveal delay-3">
            <h2>Current limitations</h2>
            <ul className="audit-list">
              <li>Voice quality variance in low-bandwidth environments can affect extraction.</li>
              <li>Model explainability still requires policy calibration for each lender profile.</li>
              <li>FastAPI adapters are POC mode until certified against production BRE payloads.</li>
              <li>Human-in-loop review remains necessary for edge-case risk scenarios.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  )
}

export default SaasStrategyPage
