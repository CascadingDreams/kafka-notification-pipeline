import { Pool } from 'pg'
import 'dotenv/config'

export const pool = new Pool({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT) ?? '5432',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? 'kafka-notifications',
})


export async function insertEvent(decodedValue: any): Promise<void> {
    // inserts events into postgres columns using pools and substitues to prevent injection
    await pool.query(
        'INSERT INTO events(event_id, event_type, user_id, payload, occurred_at) \
        VALUES ($1, $2, $3, $4, $5) \
        ON CONFLICT (event_id) DO NOTHING',
        [decodedValue.event_id, decodedValue.event_type, decodedValue.user_id, { amount: decodedValue.amount, currency: decodedValue.currency, metadata: decodedValue.metadata }, decodedValue.timestamp]
    )
}