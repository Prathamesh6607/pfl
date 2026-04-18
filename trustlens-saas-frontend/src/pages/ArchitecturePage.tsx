import { useEffect, useState } from 'react'
import TopNav from '../components/TopNav'
import { backendClient } from '../services/backendClient'
import type { ArchitectureFlow } from '../services/backendClient'

function ArchitecturePage() {
  const [flow, setFlow] = useState<ArchitectureFlow | null>(null)
  const [activeStage, setActiveStage] = useState(0)

  const stageBadges = [
    'Latency 220ms',
    'Confidence 0.92',
    'BRE rule-pass 100%',
    'Consent hash captured',
    'TTD under 2 min',
  ]

  useEffect(() => {
    backendClient.getArchitectureFlow().then(setFlow)
  }, [])

  if (!flow) {
    return (
      <div className="page-shell ambient-bg">
        <TopNav />
        <main className="landing-main">
          <section className="panel">
            <p className="empty-state">Loading architecture flow...</p>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="page-shell ambient-bg">
      <TopNav />

      <main className="landing-main">
        <section className="panel reveal">
          <p className="eyebrow">System Design</p>
          <h1>{flow.title}</h1>
          <p className="lead">{flow.subtitle}</p>

          <div className="flow-chip-row">
            {flow.layers.map((layer, index) => (
              <button
                key={layer.name}
                className={`flow-chip ${index === activeStage ? 'flow-chip-active' : ''}`}
                onClick={() => setActiveStage(index)}
              >
                {index + 1}. {layer.name}
              </button>
            ))}
          </div>

          <div className="figma-board">
            <div className="figma-lane reveal">
              <div className="lane-label">{flow.layers[activeStage]?.name}</div>
              <p>{flow.layers[activeStage]?.detail}</p>
              <div className="stage-badge">{stageBadges[activeStage]}</div>
            </div>
          </div>

          <div className="pipeline-strip">
            {flow.layers.map((layer, index) => (
              <div key={layer.name} className="pipeline-node">
                <span className={`pipeline-dot ${index <= activeStage ? 'pipeline-dot-on' : ''}`} />
                <p>{layer.name}</p>
                {index < flow.layers.length - 1 ? <span className="pipeline-arrow">{'->'}</span> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="architecture-outcomes">
          {flow.outcomes.map((item, index) => (
            <article key={item.label} className={`outcome-card reveal delay-${Math.min(index + 1, 3)}`}>
              <p className="outcome-metric">{item.metric}</p>
              <p>{item.label}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default ArchitecturePage
