// zod validation schema - validation for HTTP request body  that hits API
import { z } from 'zod'

// User Event Schema
export const UserEventInputSchema = z.object({
    event_type: z.enum(['user.registered', 'user.login', 'user.password_reset']),
    user_id: z.string().uuid(),
    metadata: z.record(z.string(), z.string()).optional(), //enforcing string values
})

// Transaction Event Schema
export const TransactionEventInputSchema = z.object({
    event_type: z.enum(['transaction.completed', 'transaction.failed', 'transaction.threshold_exceeded']),
    user_id: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.literal('AUD'),
    metadata: z.record(z.string(), z.string()).optional(),
})

// ts types - infer UserEventInput == type of above
export type UserEventInput = z.infer<typeof UserEventInputSchema>
export type TransactionEventInput = z.infer<typeof TransactionEventInputSchema>