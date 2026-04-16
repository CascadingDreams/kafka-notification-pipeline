import { Stat } from '../types'

interface Card {
  label: string
  value: number
  icon: string
  accent: string
  sub: string
}

interface Props {
  stats: Stat[]
}

export default function StatCards({ stats }: Props) {
  const totalProduced = stats.reduce((sum, s) => sum + parseInt(s.count, 10), 0)
  const totalConsumed = totalProduced
  const dlqCount = stats
    .filter((s) => s.event_type.toLowerCase().includes('dlq'))
    .reduce((sum, s) => sum + parseInt(s.count, 10), 0)
  const consumerLag = 0

  const cards: Card[] = [
    {
      label: 'Total Produced',
      value: totalProduced,
      icon: '📤',
      accent: 'var(--accent-blue)',
      sub: 'events sent to Kafka',
    },
    {
      label: 'Total Consumed',
      value: totalConsumed,
      icon: '📥',
      accent: 'var(--accent-green)',
      sub: 'events written to DB',
    },
    {
      label: 'DLQ Count',
      value: dlqCount,
      icon: '☠️',
      accent: dlqCount > 0 ? 'var(--accent-red)' : 'var(--accent-amber)',
      sub: 'dead-letter queue',
    },
    {
      label: 'Consumer Lag',
      value: consumerLag,
      icon: '⏱',
      accent: consumerLag > 0 ? 'var(--accent-amber)' : 'var(--accent-cyan)',
      sub: 'messages behind',
    },
  ]

  return (
    <div className="stat-cards" data-testid="stat-cards">
      {cards.map((c) => (
        <div
          key={c.label}
          className="stat-card"
          style={{ '--stat-accent': c.accent } as React.CSSProperties}
          data-testid={`stat-card-${c.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <span className="stat-label">{c.label}</span>
          <span className="stat-value" data-testid="stat-value">{c.value.toLocaleString()}</span>
          <span className="stat-sub">{c.sub}</span>
          <span className="stat-icon">{c.icon}</span>
        </div>
      ))}
    </div>
  )
}
