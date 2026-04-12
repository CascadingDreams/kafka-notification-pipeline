import { kafka, registry } from './client.js'
import { SchemaType } from '@kafkajs/confluent-schema-registry'
import { readFileSync } from 'fs' // to read .avsc files
import { join, dirname } from 'path' //combines path segments safely
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url)) // ESM modules - gives current files URL

// Create producer instance from Kafka connection - creating the obj
const producer = kafka.producer()

// To store schema IDs after registration - eg. {'user.events': 1, 'transaction.events': 2} - we cache these
const schemaIds: Record<string, number> = {}

// lookup table mapping event_type to kafka topic - TOPIC_MAP[event.event_type] and get back topic name to avoid big if statement
const TOPIC_MAP: Record<string, string> = {
    'user.registered': 'user.events',
    'user.login': 'user.events',
    'user.password_reset': 'user.events',
    'transaction.completed': 'transaction.events',
    'transaction.failed': 'transaction.events',
    'transaction.threshold_exceeded': 'transaction.events'
}

export async function connectProducer() {
    // Opens TCP connection to Kafka
    await producer.connect()
    console.log('Kafka producer connected')
}


export async function registerSchemas() {
    // reads both .avsc files, registers them with Schema Registry, caches the returned IDs.
    const userAvsc = JSON.parse(
        // reads user-event.avsc, returns string instead of bytes then converts into obj
        readFileSync(join(__dirname, '../../../schemas/user-event.avsc'), 'utf-8')
    )
    const txAvsc = JSON.parse(
        // reads transaction-event.avsc, returns string instead of bytes then converts into obj
        readFileSync(join(__dirname, '../../../schemas/transaction-event.avsc'), 'utf-8')
    )
    const { id: userId } = await registry.register({
        // Registers user schema with Schema Registry
        type: SchemaType.AVRO,
        schema: JSON.stringify(userAvsc),
    })
    const { id: txId } = await registry.register({
        // Registers transaction schema with Schema Registry
        type: SchemaType.AVRO,
        schema: JSON.stringify(txAvsc),
    })
    // store both IDs in the cache obj schemaIds above
    schemaIds['user.events'] = userId
    schemaIds['transaction.events'] = txId

    console.log(`Schemas registered — user: ${userId}, transaction: ${txId}`)
}

export async function produceEvent(event: Record<string, unknown>) {
    // looks up the topic from event.event_type, encodes with Avro, calls producer.send().
    const topic = TOPIC_MAP[event.event_type as string]
    if (!topic) throw new Error(`Unknown event_type: ${event.event_type as string}`)
    const schemaId = schemaIds[topic]
    if (schemaId === undefined) throw new Error(`No schema registered for topic: ${topic}`)
    const encoded = await registry.encode(schemaId, event) // takes event (obj) and schema ID, returns Buffer of Avro bytes.
    await producer.send({
        // Sends encoded msg to Kafka.
        topic,
        messages: [{
            key: event.user_id as string, // partition
            value: encoded, // avro bytes
        }],
    })
    console.log(`Produced event: ${event.event_type as string} → ${topic}`)
}


