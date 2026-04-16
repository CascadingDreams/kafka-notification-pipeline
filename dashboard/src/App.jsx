import { useState, useEffect, useCallback } from 'react'
import StatCards from './components/StatCards.jsx'
import Pipeline from './components/Pipeline.jsx'
import Throughput from './components/Throughput.jsx'
import EventLog from './components/EventLog.jsx'

const API_BASE = 'http://localhost:3001'
const POLL_INTERVAL = 3000

export default function App() {
  const [stats, setStats] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [toasts, setToasts] = useState([])

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/events/recent`),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (eventsRes.ok) setRecentEvents(await eventsRes.json())
      setLastUpdated(new Date())
    } catch {
      // silently fail — backend may not be running
    }
  }, [])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchData])

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const sendUserEvent = useCallback(async () => {
    const res = await fetch(`${API_BASE}/events/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'user.registered',
        user_id: crypto.randomUUID(),
      }),
    })
    if (!res.ok) throw new Error('User event failed')
    return res.json()
  }, [])

  const sendTransactionEvent = useCallback(async () => {
    const res = await fetch(`${API_BASE}/events/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'transaction.threshold_exceeded',
        user_id: crypto.randomUUID(),
        amount: 9500,
        currency: 'AUD',
      }),
    })
    if (!res.ok) throw new Error('Transaction event failed')
    return res.json()
  }, [])

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">⚡</div>
          <h1>Kafka Notification Pipeline</h1>
          <span className="header-badge">● LIVE</span>
        </div>
        <span className="header-meta">Last updated: {formattedTime}</span>
      </header>

      <main className="main">
        <StatCards stats={stats} />

        <Pipeline
          onSendUser={sendUserEvent}
          onSendTransaction={sendTransactionEvent}
          onSuccess={addToast}
          onError={(msg) => addToast(msg, 'error')}
          onEventSent={fetchData}
        />

        <div className="dashboard-row">
          <Throughput stats={stats} />
          <EventLog events={recentEvents} />
        </div>
      </main>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
