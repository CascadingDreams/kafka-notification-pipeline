import { describe, it, expect } from 'vitest'
import { UserEventInputSchema, TransactionEventInputSchema } from './events.js'

describe('event schema validation', () => {
    it('rejects invalid event_type', () => {
        const result = UserEventInputSchema.safeParse({
            event_type: 'user.lost',
            user_id: '550e8400-e29b-41d4-a716-446655440000'
        })
        expect(result.success).toBe(false)
    })

    it('accepts valid event_type', () => {
        const result = UserEventInputSchema.safeParse({
            event_type: 'user.registered',
            user_id: '550e8400-e29b-41d4-a716-446655440000'
        })
        expect(result.success).toBe(true)
    })

    it('rejects invalid user_id', () => {
        const result = UserEventInputSchema.safeParse({
            event_type: 'user.registered',
            user_id: '45837407906574302379067490375'
        })
        expect(result.success).toBe(false)
    })
})

describe('transaction schema validation', () => {
    it('rejects transaction amount as negative', () => {
        const result = TransactionEventInputSchema.safeParse({
            event_type: 'transaction.threshold_exceeded',
            user_id: '550e8400-e29b-41d4-a716-446655440000',
            amount: -1000,
            currency: 'AUD'
        })
        expect(result.success).toBe(false)
    })

    it('rejects transaction currecy as other than AUD', () => {
        const result = TransactionEventInputSchema.safeParse({
            event_type: 'transaction.threshold_exceeded',
            user_id: '550e8400-e29b-41d4-a716-446655440000',
            amount: 10000,
            currency: 'USD'
        })
        expect(result.success).toBe(false)
    })

    it('accepts valid transaction', () => {
        const result = TransactionEventInputSchema.safeParse({
            event_type: 'transaction.completed',
            user_id: '550e8400-e29b-41d4-a716-446655440000',
            amount: 10,
            currency: 'AUD'
        })
        expect(result.success).toBe(true)
    })
})

it.todo('omitting metadata still passes')