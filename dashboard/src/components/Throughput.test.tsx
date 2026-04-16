import { render, screen } from '@testing-library/react'
import Throughput from './Throughput'
import { Stat } from '../types'

const stats: Stat[] = [
  { event_type: 'user.registered', count: '10' },
  { event_type: 'transaction.threshold_exceeded', count: '4' },
  { event_type: 'dlq.user.registered', count: '1' },
]

describe('Throughput', () => {
  it('shows empty state message when stats are empty', () => {
    render(<Throughput stats={[]} />)
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument()
  })

  it('does not show empty state when stats are present', () => {
    render(<Throughput stats={stats} />)
    expect(screen.queryByText(/no data yet/i)).toBeNull()
  })

  it('renders the chart container when data is available', () => {
    render(<Throughput stats={stats} />)
    expect(screen.getByTestId('throughput-chart')).toBeInTheDocument()
  })
})
