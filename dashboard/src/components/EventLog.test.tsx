import { render, screen } from '@testing-library/react'
import EventLog from './EventLog'
import { Event } from '../types'

const events: Event[] = [
  {
    id: '1',
    event_id: 'evt-abc-123',
    event_type: 'user.registered',
    user_id: 'uid-xyz',
    occurred_at: '2024-01-15T10:30:00.000Z',
    status: 'processed',
  },
  {
    id: '2',
    event_id: 'evt-def-456',
    event_type: 'transaction.threshold_exceeded',
    user_id: 'uid-abc',
    occurred_at: '2024-01-15T10:31:00.000Z',
    status: 'consumed',
  },
  {
    id: '3',
    event_id: 'evt-ghi-789',
    event_type: 'dlq.user.registered',
    user_id: 'uid-dlq',
    occurred_at: '2024-01-15T10:32:00.000Z',
    status: 'failed',
  },
]

describe('EventLog', () => {
  it('shows empty state when there are no events', () => {
    render(<EventLog events={[]} />)
    expect(screen.getByText('No events yet')).toBeInTheDocument()
    expect(screen.queryByTestId('event-row')).toBeNull()
  })

  it('renders a row for each event', () => {
    render(<EventLog events={events} />)
    expect(screen.getAllByTestId('event-row')).toHaveLength(3)
  })

  it('displays the event type for each event', () => {
    render(<EventLog events={events} />)
    expect(screen.getByText('user.registered')).toBeInTheDocument()
    expect(screen.getByText('transaction.threshold_exceeded')).toBeInTheDocument()
    expect(screen.getByText('dlq.user.registered')).toBeInTheDocument()
  })

  it('applies the correct row class for each event type', () => {
    render(<EventLog events={events} />)
    const rows = screen.getAllByTestId('event-row')
    expect(rows[0]).toHaveClass('user')
    expect(rows[1]).toHaveClass('transaction')
    expect(rows[2]).toHaveClass('dlq')
  })

  it('applies status-processed class for processed events', () => {
    render(<EventLog events={[events[0]]} />)
    const statusBadge = screen.getByText('processed')
    expect(statusBadge).toHaveClass('status-processed')
  })

  it('applies status-failed class for failed events', () => {
    render(<EventLog events={[events[2]]} />)
    const statusBadge = screen.getByText('failed')
    expect(statusBadge).toHaveClass('status-failed')
  })

  it('shows pending for events with no status', () => {
    const noStatus: Event = { id: '4', event_type: 'user.registered' }
    render(<EventLog events={[noStatus]} />)
    expect(screen.getByText('pending')).toBeInTheDocument()
  })
})
