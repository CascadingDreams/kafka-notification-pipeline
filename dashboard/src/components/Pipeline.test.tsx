import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pipeline from './Pipeline'

const noop = () => {}
const resolvedFn = () => Promise.resolve()

const defaultProps = {
  onSendUser: resolvedFn,
  onSendTransaction: resolvedFn,
  onSuccess: noop,
  onError: noop,
  onEventSent: noop,
}

describe('Pipeline', () => {
  it('renders all four pipeline nodes', () => {
    render(<Pipeline {...defaultProps} />)
    expect(screen.getByTestId('pipeline-node-producer')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-node-kafka')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-node-consumer')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-node-postgres')).toBeInTheDocument()
  })

  it('renders three arrows between four nodes', () => {
    render(<Pipeline {...defaultProps} />)
    expect(screen.getByTestId('pipeline-arrow-0')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-arrow-1')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-arrow-2')).toBeInTheDocument()
  })

  it('renders the two send buttons', () => {
    render(<Pipeline {...defaultProps} />)
    expect(screen.getByTestId('btn-send-user')).toBeInTheDocument()
    expect(screen.getByTestId('btn-send-transaction')).toBeInTheDocument()
  })

  it('calls onSendUser and onEventSent when user event button is clicked', async () => {
    const onSendUser = vi.fn().mockResolvedValue({})
    const onSuccess = vi.fn()
    const onEventSent = vi.fn()

    render(
      <Pipeline
        {...defaultProps}
        onSendUser={onSendUser}
        onSuccess={onSuccess}
        onEventSent={onEventSent}
      />
    )

    await userEvent.click(screen.getByTestId('btn-send-user'))
    expect(onSendUser).toHaveBeenCalledOnce()
    expect(onSuccess).toHaveBeenCalledWith('✓ user event sent')
    expect(onEventSent).toHaveBeenCalledOnce()
  })

  it('calls onSendTransaction and onEventSent when transaction button is clicked', async () => {
    const onSendTransaction = vi.fn().mockResolvedValue({})
    const onSuccess = vi.fn()
    const onEventSent = vi.fn()

    render(
      <Pipeline
        {...defaultProps}
        onSendTransaction={onSendTransaction}
        onSuccess={onSuccess}
        onEventSent={onEventSent}
      />
    )

    await userEvent.click(screen.getByTestId('btn-send-transaction'))
    expect(onSendTransaction).toHaveBeenCalledOnce()
    expect(onSuccess).toHaveBeenCalledWith('✓ transaction event sent')
    expect(onEventSent).toHaveBeenCalledOnce()
  })

  it('calls onError when the send function rejects', async () => {
    const onSendUser = vi.fn().mockRejectedValue(new Error('Network error'))
    const onError = vi.fn()

    render(<Pipeline {...defaultProps} onSendUser={onSendUser} onError={onError} />)

    await userEvent.click(screen.getByTestId('btn-send-user'))
    expect(onError).toHaveBeenCalledWith('Failed to send user event: Network error')
  })
})
