import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const TOPIC_COLORS = {
  'user.registered': '#22c55e',
  'transaction.threshold_exceeded': '#3b82f6',
  dlq: '#ef4444',
}

const getColor = (eventType) => {
  const lower = eventType.toLowerCase()
  if (lower.includes('user')) return '#22c55e'
  if (lower.includes('transaction')) return '#3b82f6'
  if (lower.includes('dlq')) return '#ef4444'
  return '#a855f7'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1e2535',
      border: '1px solid #2a3448',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <p style={{ color: '#94a3b8', marginBottom: 4, fontFamily: 'monospace' }}>{label}</p>
      <p style={{ color: '#e2e8f0', fontWeight: 700 }}>{payload[0].value} events</p>
    </div>
  )
}

export default function Throughput({ stats }) {
  const data = stats.map((s) => ({
    name: s.event_type,
    count: parseInt(s.count, 10),
    color: getColor(s.event_type),
  }))

  return (
    <div className="throughput-card" data-testid="throughput-chart">
      <p className="card-title">Events per Topic</p>
      <div className="chart-container">
        {data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No data yet — send an event to see throughput
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3448" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                angle={-20}
                textAnchor="end"
                interval={0}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
