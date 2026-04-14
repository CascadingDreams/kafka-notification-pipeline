import { Kafka } from 'kafkajs'
import 'dotenv/config'
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry'
import { insertEvent } from './db.js'

const kafka = new Kafka({
    clientId: 'notification-consumer',
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS ?? 'localhost:9094'],
})

const consumer = kafka.consumer({ groupId: 'notification-group' })
const registry = new SchemaRegistry({ host: process.env.SCHEMA_REGISTRY_URL ?? 'http://localhost:8081' })

async function runConsumer(): Promise<void> {
    await consumer.connect()
    console.log('Consumer connected')

    await consumer.subscribe({
        topics: ['user.events', 'transaction.events'],
        fromBeginning: true,
    })

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            // decodes schema msg to json obj using schemaid
            if (!message.value) return // can be null but registry.decode expects buffer
            const decodedValue = await registry.decode(message.value)
            // write to db
            await insertEvent(decodedValue)
            // sets offset manually
            await consumer.commitOffsets([{ topic: topic, partition: partition, offset: String(Number(message.offset) + 1) }])
            console.log({ decodedValue })
            console.log('Received message:')
            console.log('  topic:', topic)
            console.log('  partition:', partition)
            console.log('  offset:', message.offset)
        },
    })
}

runConsumer().catch(console.error)
