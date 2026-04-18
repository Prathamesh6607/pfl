type MetricCardProps = {
  value: string
  label: string
  trend: string
}

function MetricCard({ value, label, trend }: MetricCardProps) {
  return (
    <article className="metric-card reveal">
      <p className="metric-value">{value}</p>
      <p className="metric-label">{label}</p>
      <p className="metric-trend">{trend}</p>
    </article>
  )
}

export default MetricCard
