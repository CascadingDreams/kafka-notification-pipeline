import { Kafka } from 'kafkajs'
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry'

const isProduction = process.env.NODE_ENV === 'production'

export const kafka = new Kafka({
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS!],
    ...(isProduction && {
        ssl: true,
        sasl: {
            mechanism: 'plain' as const,
            userrname: process.env.KAFKA_API_KEY!,
            password: process.env.KAFKA_API_SECRET!,
        },
    }),
})

export const registry = new SchemaRegistry({
    host: process.env.SCHEMA_REGISTRY_URL!,
    ...(isProduction && {
        auth: {
            username: process.env.SCHEMA_REGISTRY_API_KEY!,
            password: process.env.SCHEMA_REGISTRY_API_SECRET!,
        },
    }),
})
