import React, { useState, useCallback } from 'react'

interface Node {
  id: string
  label: string
  sub: string
  icon: string
  color: string
  bg: string
  glow: string
}

interface Props {
  onSendUser: () => Promise<unknown>
  onSendTransaction: () => Promise<unknown>
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
  onEventSent: () => void
}

const NODES: Node[] = [
  { id: 'producer', label: 'Producer', sub: 'Hono API', icon: '🚀', color: 'var(--accent-green)', bg: 'rgba(34,197,94,0.12)', glow: 'rgba(34,197,94,0.4)' },
  { id: 'kafka', label: 'Kafka', sub: 'Topic broker', icon: '⚡', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.4)' },
  { id: 'consumer', label: 'Consumer', sub: 'Node.js worker', icon: '⚙️', color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.12)', glow: 'rgba(59,130,246,0.4)' },
  { id: 'postgres', label: 'PostgreSQL', sub: 'Persistent store', icon: '🐘', color: 'var(--accent-purple)', bg: 'rgba(168,85,247,0.12)', glow: 'rgba(168,85,247,0.4)' },
]

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

export default function Pipeline({ onSendUser, onSendTransaction, onSuccess, onError, onEventSent }: Props) {
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set())
  const [activeArrows, setActiveArrows] = useState<Set<number>>(new Set())
  const [animating, setAnimating] = useState(false)

  const runAnimation = useCallback(async () => {
    setAnimating(true)
    for (let i = 0; i < NODES.length; i++) {
      setActiveNodes((prev) => new Set([...prev, NODES[i].id]))
      if (i < NODES.length - 1) {
        setActiveArrows((prev) => new Set([...prev, i]))
      }
      await delay(420)
    }
    await delay(1200)
    setActiveNodes(new Set())
    setActiveArrows(new Set())
    setAnimating(false)
  }, [])

  const handleSend = useCallback(
    async (sendFn: () => Promise<unknown>, label: string) => {
      if (animating) return
      try {
        await sendFn()
        onSuccess(`✓ ${label} sent`)
        onEventSent()
        runAnimation()
      } catch (err) {
        onError(`Failed to send ${label}: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [animating, onSuccess, onError, onEventSent, runAnimation]
  )

  return (
    <div className="pipeline-card" data-testid="pipeline">
      <p className="card-title">Pipeline Visualiser</p>

      <div className="pipeline-controls">
        <button
          className="btn btn-green"
          disabled={animating}
          onClick={() => handleSend(onSendUser, 'user event')}
          data-testid="btn-send-user"
        >
          <span>👤</span> Send user event
        </button>
        <button
          className="btn btn-blue"
          disabled={animating}
          onClick={() => handleSend(onSendTransaction, 'transaction event')}
          data-testid="btn-send-transaction"
        >
          <span>💳</span> Send transaction event
        </button>
      </div>

      <div className="pipeline-track" data-testid="pipeline-track">
        {NODES.map((node, i) => (
          <React.Fragment key={node.id}>
            <div
              className={`pipeline-node${activeNodes.has(node.id) ? ' active' : ''}`}
              data-testid={`pipeline-node-${node.id}`}
              style={{
                '--node-color': node.color,
                '--node-bg': node.bg,
                '--node-glow': node.glow,
              } as React.CSSProperties}
            >
              <div className="node-icon-wrap">{node.icon}</div>
              <span className="node-label">{node.label}</span>
              <span className="node-sub">{node.sub}</span>
            </div>
            {i < NODES.length - 1 && (
              <div
                className={`pipeline-arrow${activeArrows.has(i) ? ' flowing' : ''}`}
                data-testid={`pipeline-arrow-${i}`}
              >
                <div className="pipeline-dot" />
                <div className="pipeline-arrow-head" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
