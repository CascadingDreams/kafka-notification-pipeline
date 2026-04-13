import { Kafka } from 'kafkajs'
import 'dotenv/config'

const kafka = new Kafka({
    clientId: 'notification-consumer',
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS ?? 'localhost:9094'],
})

const consumer = kafka.consumer({ groupId: 'notification-group' })

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
            console.log('Received message:')
            console.log('  topic:', topic)
            console.log('  partition:', partition)
            console.log('  offset:', message.offset)
            console.log('  value (raw bytes):', message.value)
        },
    })
}

runConsumer().catch(console.error)