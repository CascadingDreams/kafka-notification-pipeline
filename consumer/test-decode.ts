import { Kafka } from 'kafkajs'
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry'


const registry = new SchemaRegistry({ host: 'http://schema-registry:8081/' })
const decodedValue = await registry.decode(message.value)
