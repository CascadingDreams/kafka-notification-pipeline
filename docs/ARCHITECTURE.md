# Architecture

## Overview

```
HTTP client
    │
    ▼
Producer API (Hono · :3001)
    │  Zod validation → Avro encode (schema ID embedded)
    ▼
Apache Kafka (KRaft · :9094)
    ├── user.events        (3 partitions)
    ├── transaction.events (3 partitions)
    └── dlq                (catch failed consumer messages)
    │
    ▼
Consumer (kafkajs · notification-group)
    │  Avro decode via Schema Registry → insertEvent → manual offset commit
    │  on error → forward to dlq topic
    ▼
PostgreSQL 16 (:5432)
    └── events table (idempotent on event_id)
```

Confluent Schema Registry (:8081) sits alongside Kafka. The producer registers schemas on startup and embeds the schema ID in every message. The consumer resolves that ID at decode time — producer and consumer never share schema files directly.

---

## Components

### Producer (`producer/`)

- **Framework:** Hono on Node.js
- **Validation:** Zod at the HTTP boundary — invalid payloads are rejected before touching Kafka
- **Serialisation:** `@kafkajs/confluent-schema-registry` encodes each event as Avro bytes with the schema ID prepended in Confluent wire format
- **Startup sequence:** Kafka connects → schemas registered with Schema Registry → HTTP server starts on `:3001`

### Consumer (`consumer/`)

- **Library:** kafkajs
- **Group:** `notification-group` — supports horizontal scaling by adding instances
- **Offset strategy:** `autoCommit: false` — offsets are committed only after a successful DB write, giving at-least-once delivery semantics
- **Error handling:** Any message that throws during decode or insert is forwarded to the `dlq` topic via a dedicated producer; the consumer group advances and healthy messages are not blocked
- **Idempotency:** `ON CONFLICT (event_id) DO NOTHING` — safe to replay on redelivery

### PostgreSQL

Single `events` table. Both event types share the schema; transaction-specific fields (`amount`, `currency`, `metadata`) are stored in a JSONB `payload` column rather than nullable columns.

| Column | Type | Notes |
|---|---|---|
| `event_id` | UUID | Primary key, unique constraint drives idempotency |
| `event_type` | text | e.g. `user.registered`, `transaction.threshold_exceeded` |
| `user_id` | UUID | — |
| `payload` | JSONB | `amount`, `currency`, `metadata` |
| `occurred_at` | timestamptz | ISO 8601 timestamp from the event |

### Schema Registry

Confluent Schema Registry acts as the single source of truth for Avro schemas. The schema ID travels with every message, so schema evolution (adding optional fields) can be rolled out without coordinating a producer/consumer restart.

---

## Design decisions

**KRaft instead of Zookeeper** — Kafka 3.9 runs without Zookeeper. Simpler Docker Compose, fewer moving parts, reflects the direction of production deployments.

**Manual offset commit** — Auto-commit can advance the offset before the DB write succeeds, meaning a crash would silently drop messages. Manual commit after `insertEvent` trades throughput for correctness.

**Dead letter queue** — Rather than crashing the consumer on a bad message, failed messages are forwarded to `dlq`. This preserves the original bytes for inspection and replay while keeping the main topics flowing.

**JSONB payload column** — Storing the variable transaction fields as JSONB avoids a wide table with nullable columns and keeps the insert logic the same for both event types. Querying specific fields is still possible with Postgres JSON operators.

**Message key = `user_id`** — Kafka guarantees ordering within a partition. Keying by `user_id` ensures all events for a given user land in the same partition, preserving per-user event order across the consumer group.
