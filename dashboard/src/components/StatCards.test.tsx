import { render, screen } from '@testing-library/react'
import StatCards from './StatCards'
import { Stat } from '../types'

const stats: Stat[] = [
  { event_type: 'user.registered', count: '5' },
  { event_type: 'transaction.threshold_exceeded', count: '3' },
]

const dlqStats: Stat[] = [
  ...stats,
  { event_type: 'dlq.user.registered', count: '2' },
]

describe('StatCards', () => {
  it('renders all four stat cards', () => {
    render(<StatCards stats={[]} />)
    expect(screen.getByTestId('stat-card-total-produced')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card-total-consumed')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card-dlq-count')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card-consumer-lag')).toBeInTheDocument()
  })

  it('shows zero counts when stats are empty', () => {
    render(<StatCards stats={[]} />)
    const values = screen.getAllByTestId('stat-value')
    expect(values).toHaveLength(4)
    values.forEach((v) => expect(v).toHaveTextContent('0'))
  })

  it('sums all event counts for Total Produced', () => {
    render(<StatCards stats={stats} />)
    const produced = screen.getByTestId('stat-card-total-produced')
    expect(produced).toHaveTextContent('8') // 5 + 3
  })

  it('shows DLQ count from dlq-prefixed events', () => {
    render(<StatCards stats={dlqStats} />)
    const dlq = screen.getByTestId('stat-card-dlq-count')
    expect(dlq).toHaveTextContent('2')
  })

  it('consumer lag is always 0', () => {
    render(<StatCards stats={stats} />)
    const lag = screen.getByTestId('stat-card-consumer-lag')
    expect(lag).toHaveTextContent('0')
  })
})
