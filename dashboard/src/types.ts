export interface Stat {
  event_type: string
  count: string
}

export interface Event {
  id?: string
  event_id?: string
  event_type: string
  user_id?: string
  occurred_at?: string
  status?: string
}

export type ToastType = 'success' | 'error'

export interface Toast {
  id: number
  msg: string
  type: ToastType
}
