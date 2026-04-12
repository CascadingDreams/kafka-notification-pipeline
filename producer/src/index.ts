import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator' // Zod to Hono
import { randomUUID } from 'crypto'
import { logger } from 'hono/logger'
import { connectProducer, registerSchemas, produceEvent } from './kafka/producer.js'
import { UserEventInputSchema, TransactionEventInputSchema } from './schemas/events.js'

const app = new Hono()

// logs requests to endpoints
app.use('*', logger())

// Register GET route at /health -> sends JSON response (used by fly.io for health checks)
app.get('/health', (c) => c.json({ status: 'ok' }))

app.post(
    '/events/user',
    zValidator('json', UserEventInputSchema),
    async (c) => {
        // Gets request body, full autocomplete on body.event_type, body.user_id etc.
        const body = c.req.valid('json')
        const event = {
            // Build full event obj that will be sent to Kafka. 
            event_id: randomUUID(),
            event_type: body.event_type,
            user_id: body.user_id,
            timestamp: new Date().toISOString(),
            metadata: body.metadata ?? {}, // default to empty
        }
        //calls produceEvent function to encode and send event to Kafka.
        await produceEvent(event)
        // returns json with 202 accepted
        return c.json({ status: 'accepted', event_id: event.event_id }, 202)
    }
)

app.post(
    '/events/transactions',
    zValidator('json', TransactionEventInputSchema),
    async (c) => {
        const body = c.req.valid('json')
        const event = {
            event_id: randomUUID(),
            event_type: body.event_type,
            user_id: body.user_id,
            amount: body.amount,
            currency: body.currency,
            timestamp: new Date().toISOString(),
            metadata: body.metadata ?? {},
        }
        await produceEvent(event)
        return c.json({ status: 'accepted', event_id: event.event_id }, 202)
    }
)

// runs everything in correct order on startup - connectProducer and registerSchemas are async
async function start() {
    // Connects to kafka first
    await connectProducer()
    // registers Avro schemas and caches the IDs - otherwise schemaIds would be empty
    await registerSchemas()

    // starts HTTP server on port 3001
    serve({ fetch: app.fetch, port: 3001 }, () => {
        console.log('Producer runnning on http://localhost:3001')
    })
}

// calls start to kick eveything off
start().catch(console.error)