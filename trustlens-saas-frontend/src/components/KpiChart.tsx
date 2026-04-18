import type { KpiPoint } from '../services/backendClient'

type KpiChartProps = {
  points: KpiPoint[]
}

function KpiChart({ points }: KpiChartProps) {
  if (points.length === 0) {
    return <p className="empty-state">Waiting for KPI stream data...</p>
  }

  const lastFive = points.slice(-5)

  return (
    <div className="kpi-chart-grid">
      <article className="chart-card">
        <h3>Drop-off Reduction Trend</h3>
        <div className="bar-row">
          {lastFive.map((point) => (
            <div key={point.time} className="bar-wrap">
              <div
                className="bar"
                style={{ height: `${Math.max(18, point.dropOffReduction * 2)}px` }}
              />
              <p>{point.time}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="chart-card">
        <h3>Underwriting Efficiency</h3>
        <svg viewBox="0 0 300 120" className="line-chart" role="img" aria-label="TTD trend">
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={lastFive
              .map((point, index) => {
                const x = 25 + index * 62
                const y = 105 - (point.reviewReduction - 40) * 4
                return `${x},${y}`
              })
              .join(' ')}
          />
        </svg>
        <p className="chart-caption">Live stream from Lentra integration logs (POC mode)</p>
      </article>
    </div>
  )
}

export default KpiChart
