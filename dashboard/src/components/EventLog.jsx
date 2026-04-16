const getEventClass = (eventType) => {
  const lower = (eventType || '').toLowerCase()
  if (lower.includes('dlq')) return 'dlq'
  if (lower.includes('user')) return 'user'
  if (lower.includes('transaction')) return 'transaction'
  return 'user'
}

const getStatusClass = (status) => {
  if (!status) return 'status-pending'
  const s = status.toLowerCase()
  if (s === 'processed' || s === 'consumed') return 'status-processed'
  if (s === 'failed' || s === 'dlq') return 'status-failed'
  return 'status-pending'
}

const formatTime = (ts) => {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ts
  }
}

const truncate = (str, n = 20) =>
  typeof str === 'string' && str.length > n ? str.slice(0, n) + '…' : str ?? '—'

export default function EventLog({ events }) {
  return (
    <div className="event-log-card" data-testid="event-log">
      <p className="card-title">Recent Events</p>

      {events.length === 0 ? (
        <div className="event-log-empty">No events yet</div>
      ) : (
        <div className="event-log-scroll">
          {events.map((ev) => {
            const cls = getEventClass(ev.event_type)
            return (
              <div
                key={ev.id ?? ev.event_id}
                className={`event-row ${cls}`}
                data-testid="event-row"
              >
                <span className="event-dot" />
                <div className="event-body">
                  <span className="event-type">{ev.event_type}</span>
                  <div className="event-meta">
                    <span className="event-meta-item" title={ev.event_id}>
                      {truncate(ev.event_id, 16)}
                    </span>
                    <span className="event-meta-item" title={ev.user_id}>
                      uid:{truncate(ev.user_id, 12)}
                    </span>
                    <span className="event-meta-item">{formatTime(ev.occurred_at)}</span>
                  </div>
                </div>
                <span className={`event-status ${getStatusClass(ev.status)}`}>
                  {ev.status ?? 'pending'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
